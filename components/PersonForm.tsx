import DropDownPicker from 'react-native-dropdown-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { apiFetch } from "../services/FetchAPI";

interface Personne {
  id: number;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string;
  birth_place?: string;
  fatherId?: number;
  motherId?: number;
  conjointId?: number;
  notes?: string;
  dateDeces?: string;
  photo?: string;
}

interface PersonFormProps {
  initialData?: Personne | null;
  mode?: "add" | "edit";
  onSuccess?: (() => void) | null;
}

interface ImageAsset {
  uri: string;
  type?: string;
  name?: string;
}

interface DropdownItem {
  label: string;
  value: string;
}

// Fonction utilitaire pour convertir dataURI en Blob
function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

export default function PersonForm({ 
  initialData = null, 
  mode = "add",
  onSuccess = null 
}: PersonFormProps): JSX.Element {
  const [first_name, setFirstName] = useState<string>("");
  const [last_name, setLastName] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [birth_date, setBirthDate] = useState<string>("");
  const [birth_place, setBirthPlace] = useState<string>("");
  const [father, setFather] = useState<string>("");
  const [mother, setMother] = useState<string>("");
  const [conjoint, setConjoint] = useState<string>("");
  const [photo, setPhoto] = useState<ImageAsset | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [date_deces, setDateDeces] = useState<string>("");
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [showDateDeces, setShowDateDeces] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // États pour les dropdowns
  const [genderOpen, setGenderOpen] = useState<boolean>(false);
  const [fatherOpen, setFatherOpen] = useState<boolean>(false);
  const [motherOpen, setMotherOpen] = useState<boolean>(false);
  const [conjointOpen, setConjointOpen] = useState<boolean>(false);

  // Items pour les dropdowns
  const [genderItems, setGenderItems] = useState<DropdownItem[]>([
    {label: 'Homme', value: 'Homme'},
    {label: 'Femme', value: 'Femme'}
  ]);
  const [fatherItems, setFatherItems] = useState<DropdownItem[]>([]);
  const [motherItems, setMotherItems] = useState<DropdownItem[]>([]);
  const [conjointItems, setConjointItems] = useState<DropdownItem[]>([]);

  const router = useRouter();

  // Initialiser le formulaire avec les données existantes
  useEffect(() => {
    if (initialData && mode === "edit") {
      setFirstName(initialData.first_name || "");
      setLastName(initialData.last_name || "");
      setGender(initialData.gender || "");
      setBirthDate(initialData.birth_date || "");
      setBirthPlace(initialData.birth_place || "");
      setFather(initialData.fatherId ? initialData.fatherId.toString() : "");
      setMother(initialData.motherId ? initialData.motherId.toString() : "");
      setConjoint(initialData.conjointId ? initialData.conjointId.toString() : "");
      setNotes(initialData.notes || "");
      setDateDeces(initialData.dateDeces || "");
      setShowDateDeces(!!initialData.dateDeces);
      if (initialData.photo) {
        setPhoto({ uri: initialData.photo });
      }
    }
  }, [initialData, mode]);

  // Charger la liste des personnes
  useEffect(() => {
    apiFetch("/personnes")
      .then((res) => res.json())
      .then((data: Personne[]) => {
        setPersonnes(data);
        updateDropdownItems(data);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des personnes:", error);
        Alert.alert("Erreur", "Impossible de charger la liste des personnes");
      });
  }, []);

  // Mettre à jour les items des dropdowns
  const updateDropdownItems = (personnesData: Personne[]) => {
    const hommes = personnesData
      .filter(p => p.gender === "Homme" && (!initialData || p.id !== initialData.id))
      .map(p => ({ label: `${p.last_name} ${p.first_name}`, value: p.id.toString() }));
    
    const femmes = personnesData
      .filter(p => p.gender === "Femme" && (!initialData || p.id !== initialData.id))
      .map(p => ({ label: `${p.last_name} ${p.first_name}`, value: p.id.toString() }));

    setFatherItems(hommes);
    setMotherItems(femmes);
  };

  // Mettre à jour les options de conjoint selon le genre
  useEffect(() => {
    if (gender && personnes.length > 0) {
      const targetGender = gender === "Homme" ? "Femme" : "Homme";
      const conjointOptions = personnes
        .filter(p => p.gender === targetGender && (!initialData || p.id !== initialData.id))
        .map(p => ({ label: `${p.last_name} ${p.first_name}`, value: p.id.toString() }));
      
      setConjointItems(conjointOptions);

      // Vérifier si le conjoint actuel est toujours valide
      if (conjoint) {
        const isValidConjoint = conjointOptions.some(option => option.value === conjoint);
        if (!isValidConjoint) {
          setConjoint("");
        }
      }
    } else {
      setConjointItems([]);
    }
  }, [gender, personnes, initialData, conjoint]);

  const pickImage = async (): Promise<void> => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission refusée", "L'accès à la galerie est nécessaire pour sélectionner une photo");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!first_name || !last_name || !gender || !birth_date) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      
      // Données de base
      formData.append("first_name", first_name);
      formData.append("last_name", last_name);
      formData.append("gender", gender);
      formData.append("birth_place", birth_place);
      formData.append("notes", notes);

      // Date de naissance - conversion si nécessaire
      if (birth_date.includes('/')) {
        const parts = birth_date.split('/');
        if (parts.length === 3) {
          formData.append("birth_date", `${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          formData.append("birth_date", birth_date);
        }
      } else {
        formData.append("birth_date", birth_date);
      }

      // Relations familiales
      formData.append("fatherId", father || '');
      formData.append("motherId", mother || '');
      formData.append("conjointId", conjoint || '');

      // Date de décès
      if (date_deces) {
        if (date_deces.includes('/')) {
          const parts = date_deces.split('/');
          if (parts.length === 3) {
            formData.append("dateDeces", `${parts[2]}-${parts[1]}-${parts[0]}`);
          } else {
            formData.append("dateDeces", date_deces);
          }
        } else {
          formData.append("dateDeces", date_deces);
        }
      }

      // Gestion de la photo
      if (photo && photo.uri) {
        const uri = photo.uri;
        let name = 'photo.jpg';
        let type = 'image/jpeg';

        if (typeof uri === 'string' && uri.startsWith('data:')) {
          const match = uri.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
          if (match) {
            type = match[1];
            const ext = type.split('/')[1] || 'jpg';
            name = `photo.${ext}`;
          }
          const blob = dataURItoBlob(uri);
          formData.append('photo', blob, name);
        } else if (typeof uri === 'string') {
          name = uri.split('/').pop() || 'photo.jpg';
          const extMatch = /\.(\w+)$/.exec(name);
          type = extMatch ? `image/${extMatch[1]}` : 'image/jpeg';
          formData.append('photo', { uri, name, type } as any);
        }
      }

      const url = mode === "edit" ? `/personnes/${initialData?.id}/` : "/personnes/";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await apiFetch(url, {
        method: method,
        body: formData,
      });

      if (response.ok) {
        Alert.alert(
          "Succès", 
          `Personne ${mode === "edit" ? "modifiée" : "ajoutée"} avec succès`,
          [
            {
              text: "OK",
              onPress: () => {
                if (onSuccess) {
                  onSuccess();
                } else {
                  router.push("/personnes");
                }
              }
            }
          ]
        );
      } else {
        const errorText = await response.text();
        console.error('Erreur serveur:', errorText);
        throw new Error(errorText);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      Alert.alert("Erreur", `Erreur lors de ${mode === "edit" ? "la modification" : "l'ajout"} !`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (): void => {
    setFirstName("");
    setLastName("");
    setGender("");
    setBirthDate("");
    setBirthPlace("");
    setFather("");
    setMother("");
    setConjoint("");
    setPhoto(null);
    setNotes("");
    setDateDeces("");
    setShowDateDeces(false);
  };

  // Fonction pour fermer tous les dropdowns sauf celui spécifié
  const closeOtherDropdowns = (exceptDropdown: string) => {
    if (exceptDropdown !== 'gender') setGenderOpen(false);
    if (exceptDropdown !== 'father') setFatherOpen(false);
    if (exceptDropdown !== 'mother') setMotherOpen(false);
    if (exceptDropdown !== 'conjoint') setConjointOpen(false);
  };

  return (
    <KeyboardAwareScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
    >
      <Animated.View 
        entering={FadeIn.duration(500)} 
        style={styles.formContainer}
      >
        {/* Titre */}
        <Animated.View entering={SlideInDown.delay(100)} style={styles.headerContainer}>
          <Text style={styles.title}>
            {mode === "edit" ? "Modifier une personne" : "Ajouter une personne"}
          </Text>
        </Animated.View>

        {/* Section Identité */}
        <Animated.View entering={SlideInDown.delay(200)} style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👤 Identité</Text>
          </View>

          {/* Nom et Prénom */}
          <View style={styles.rowContainer}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Nom *</Text>
              <TextInput
                style={styles.textInput}
                value={last_name}
                onChangeText={setLastName}
                placeholder="Nom de famille"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Prénom *</Text>
              <TextInput
                style={styles.textInput}
                value={first_name}
                onChangeText={setFirstName}
                placeholder="Prénom"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Date et lieu de naissance */}
          <View style={styles.rowContainer}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Date de naissance *</Text>
              <TextInput
                style={styles.textInput}
                value={birth_date}
                onChangeText={setBirthDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Lieu de naissance</Text>
              <TextInput
                style={styles.textInput}
                value={birth_place}
                onChangeText={setBirthPlace}
                placeholder="Lieu de naissance"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Sexe et Photo */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputHalf, { zIndex: 1000 }]}>
              <Text style={styles.label}>Sexe *</Text>
              <DropDownPicker
                open={genderOpen}
                value={gender}
                items={genderItems}
                setOpen={setGenderOpen}
                setValue={setGender}
                setItems={setGenderItems}
                onOpen={() => closeOtherDropdowns('gender')}
                placeholder="--Choisir--"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                arrowIconStyle={styles.dropdownArrow}
                tickIconStyle={styles.dropdownTick}
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Photo</Text>
              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                <Text style={styles.photoButtonText}>
                  {photo ? "Photo sélectionnée" : "Choisir une photo"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Séparateur */}
        <View style={styles.separator} />

        {/* Section Famille */}
        <Animated.View entering={SlideInDown.delay(300)} style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👥 Famille et relations</Text>
          </View>

          {/* Père et Mère */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputHalf, { zIndex: 900 }]}>
              <Text style={styles.label}>Père</Text>
              <DropDownPicker
                open={fatherOpen}
                value={father}
                items={fatherItems}
                setOpen={setFatherOpen}
                setValue={setFather}
                setItems={setFatherItems}
                onOpen={() => closeOtherDropdowns('father')}
                placeholder="--Aucun--"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                arrowIconStyle={styles.dropdownArrow}
                tickIconStyle={styles.dropdownTick}
                searchable={true}
                searchPlaceholder="Rechercher..."
                searchTextInputStyle={styles.searchInput}
              />
            </View>
            <View style={[styles.inputHalf, { zIndex: 800 }]}>
              <Text style={styles.label}>Mère</Text>
              <DropDownPicker
                open={motherOpen}
                value={mother}
                items={motherItems}
                setOpen={setMotherOpen}
                setValue={setMother}
                setItems={setMotherItems}
                onOpen={() => closeOtherDropdowns('mother')}
                placeholder="--Aucune--"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                arrowIconStyle={styles.dropdownArrow}
                tickIconStyle={styles.dropdownTick}
                searchable={true}
                searchPlaceholder="Rechercher..."
                searchTextInputStyle={styles.searchInput}
              />
            </View>
          </View>

          {/* Conjoint et Date de décès */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputHalf, { zIndex: 700 }]}>
              <Text style={styles.label}>Conjoint</Text>
              <DropDownPicker
                open={conjointOpen}
                value={conjoint}
                items={conjointItems}
                setOpen={setConjointOpen}
                setValue={setConjoint}
                setItems={setConjointItems}
                onOpen={() => closeOtherDropdowns('conjoint')}
                placeholder="--Aucun--"
                disabled={!gender}
                style={[
                  styles.dropdown, 
                  !gender && styles.disabledDropdown
                ]}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                arrowIconStyle={styles.dropdownArrow}
                tickIconStyle={styles.dropdownTick}
                searchable={true}
                searchPlaceholder="Rechercher..."
                searchTextInputStyle={styles.searchInput}
              />
              {gender && conjointItems.length === 0 && (
                <Text style={styles.helperText}>
                  Aucun {gender === "Homme" ? "femme" : "homme"} disponible
                </Text>
              )}
            </View>
            <View style={styles.inputHalf}>
              {!showDateDeces ? (
                <View>
                  <Text style={styles.label}>+</Text>
                  <TouchableOpacity
                    style={styles.moreButton}
                    onPress={() => setShowDateDeces(true)}
                  >
                    <Text style={styles.moreButtonText}>Plus</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Animated.View entering={FadeIn}>
                  <Text style={styles.label}>Date de décès</Text>
                  <TextInput
                    style={styles.textInput}
                    value={date_deces}
                    onChangeText={setDateDeces}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                  />
                </Animated.View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Notes */}
        <Animated.View entering={SlideInDown.delay(400)} style={styles.fullWidthContainer}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Notes additionnelles..."
            placeholderTextColor="#9CA3AF"
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Animated.View>

        {/* Boutons d'action */}
        <Animated.View entering={SlideInDown.delay(500)} style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#064E3B" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>✓</Text>
            )}
            <Text style={styles.submitButtonText}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Text>
          </TouchableOpacity>
          
          {mode === "add" && (
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetForm}
            >
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animated.View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  formContainer: {
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 24,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#67E8F9",
    textAlign: "center",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#67E8F9",
  },
  rowContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
  },
  fullWidthContainer: {
    marginBottom: 24,
  },
  label: {
    color: "#67E8F9",
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 16,
  },
  textInput: {
    backgroundColor: "#374151",
    borderWidth: 1,
    borderColor: "#06B6D4",
    borderRadius: 6,
    padding: 12,
    color: "white",
    fontSize: 16,
    minHeight: 50,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  // Styles pour les dropdowns
  dropdown: {
    backgroundColor: "#374151",
    borderColor: "#06B6D4",
    borderWidth: 1,
    borderRadius: 6,
    minHeight: 50,
  },
  dropdownContainer: {
    backgroundColor: "#374151",
    borderColor: "#06B6D4",
    borderWidth: 1,
    borderRadius: 6,
    maxHeight: 200,
  },
  dropdownText: {
    color: "white",
    fontSize: 16,
  },
  dropdownPlaceholder: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  dropdownArrow: {
    tintColor: "white",
  },
  dropdownTick: {
    tintColor: "#06B6D4",
  },
  searchInput: {
    backgroundColor: "#4B5563",
    borderColor: "#6B7280",
    color: "white",
  },
  disabledDropdown: {
    opacity: 0.5,
    borderColor: "#6B7280",
  },
  photoButton: {
    backgroundColor: "#374151",
    borderWidth: 1,
    borderColor: "#06B6D4",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  photoButtonText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  moreButton: {
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  moreButtonText: {
    color: "#06B6D4",
    fontWeight: "bold",
    fontSize: 16,
  },
  helperText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#0891B2",
    marginVertical: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 24,
  },
  submitButton: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    color: "#064E3B",
    fontWeight: "bold",
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: "#4B5563",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 6,
  },
  resetButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
});