import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { apiFetch } from "../services/FetchAPI";

export default function PersonForm({ 
  initialData = null, 
  mode = "add", // "add" ou "edit"
  onSuccess = null 
}) {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [birth_date, setBirthDate] = useState("");
  const [birth_place, setBirthPlace] = useState("");
  const [father, setFather] = useState("");
  const [mother, setMother] = useState("");
  const [conjoint, setConjoint] = useState("");
  const [photo, setPhoto] = useState(null);
  const [notes, setNotes] = useState("");
  const [date_deces, setDateDeces] = useState("");
  const [personnes, setPersonnes] = useState([]);
  const [showDateDeces, setShowDateDeces] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState({ birth: false, death: false });
  
  const router = useRouter();

  // Initialiser le formulaire avec les données existantes
  useEffect(() => {
    if (initialData && mode === "edit") {
      setFirstName(initialData.first_name || "");
      setLastName(initialData.last_name || "");
      setGender(initialData.gender || "");
      setBirthDate(initialData.birth_date || "");
      setBirthPlace(initialData.birth_place || "");
      setFather(initialData.fatherId || "");
      setMother(initialData.motherId || "");
      setConjoint(initialData.conjointId || "");
      setNotes(initialData.notes || "");
      setDateDeces(initialData.dateDeces || "");
      setShowDateDeces(!!initialData.dateDeces);
    }
  }, [initialData, mode]);

  // Charger la liste des personnes
  useEffect(() => {
    apiFetch("/personnes")
      .then((res) => res.json())
      .then((data) => setPersonnes(data))
      .catch((error) => {
        console.error("Erreur lors du chargement des personnes:", error);
        Alert.alert("Erreur", "Impossible de charger la liste des personnes");
      });
  }, []);

  // Réinitialiser le conjoint si le genre change et n'est plus compatible
  useEffect(() => {
    if (conjoint && gender) {
      const selectedConjoint = personnes.find(p => p.id.toString() === conjoint.toString());
      if (selectedConjoint) {
        const expectedGender = gender === "Homme" ? "Femme" : "Homme";
        if (selectedConjoint.gender !== expectedGender) {
          setConjoint(""); // Réinitialiser si incompatible
        }
      }
    }
  }, [gender, conjoint, personnes]);

  // Fonctions de filtrage par genre
  const getFilteredPersonnes = (targetGender, excludeSelf = true) => {
    return personnes.filter(p => {
      // Exclure la personne elle-même en mode édition
      if (excludeSelf && mode === "edit" && initialData && p.id === initialData.id) {
        return false;
      }
      // Filtrer par genre
      return p.gender === targetGender;
    });
  };

  const getConjointOptions = () => {
    if (!gender) return []; // Pas d'options si le genre n'est pas sélectionné
    
    // Si la personne est un homme, montrer les femmes
    // Si la personne est une femme, montrer les hommes
    const targetGender = gender === "Homme" ? "Femme" : "Homme";
    return getFilteredPersonnes(targetGender, true);
  };

  const pickImage = async () => {
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

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const handleSubmit = async () => {
    if (!first_name || !last_name || !gender || !birth_date) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("first_name", first_name);
      formData.append("last_name", last_name);
      formData.append("gender", gender);
      formData.append("birth_date", birth_date);
      formData.append("birth_place", birth_place);
      if (father) formData.append("fatherId", father);
      if (mother) formData.append("motherId", mother);
      if (conjoint) formData.append("conjointId", conjoint);
      if (photo) {
        formData.append("photo", {
          uri: photo.uri,
          type: "image/jpeg",
          name: "photo.jpg",
        });
      }
      formData.append("notes", notes);
      if (date_deces) formData.append("dateDeces", date_deces);

      const url = mode === "edit" ? `/personnes/${initialData.id}` : "/personnes";
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
        throw new Error(errorText);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      Alert.alert("Erreur", `Erreur lors de ${mode === "edit" ? "la modification" : "l'ajout"} !`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
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

  const renderPickerItems = (options, placeholder) => [
    <Picker.Item key="empty" label={placeholder} value="" color="#9CA3AF" />,
    ...options.map(option => (
      <Picker.Item 
        key={option.id} 
        label={`${option.last_name} ${option.first_name}`} 
        value={option.id.toString()}
        color="white"
      />
    ))
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.formContainer}>
        {/* Titre */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>
            {mode === "edit" ? "Modifier une personne" : "Ajouter une personne"}
          </Text>
        </View>

        {/* Section Identité */}
        <View style={styles.sectionContainer}>
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
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Sexe *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={gender}
                  style={styles.picker}
                  onValueChange={setGender}
                  dropdownIconColor="white"
                >
                  <Picker.Item label="--Choisir--" value="" color="#9CA3AF" />
                  <Picker.Item label="Homme" value="Homme" color="white" />
                  <Picker.Item label="Femme" value="Femme" color="white" />
                </Picker>
              </View>
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
        </View>

        {/* Séparateur */}
        <View style={styles.separator} />

        {/* Section Famille */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👥 Famille et relations</Text>
          </View>

          {/* Père et Mère */}
          <View style={styles.rowContainer}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Père</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={father}
                  style={styles.picker}
                  onValueChange={setFather}
                  dropdownIconColor="white"
                >
                  {renderPickerItems(getFilteredPersonnes("Homme", true), "--Aucun--")}
                </Picker>
              </View>
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Mère</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={mother}
                  style={styles.picker}
                  onValueChange={setMother}
                  dropdownIconColor="white"
                >
                  {renderPickerItems(getFilteredPersonnes("Femme", true), "--Aucune--")}
                </Picker>
              </View>
            </View>
          </View>

          {/* Conjoint et Date de décès */}
          <View style={styles.rowContainer}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Conjoint</Text>
              <View style={[styles.pickerContainer, !gender && styles.disabledPicker]}>
                <Picker
                  selectedValue={conjoint}
                  style={styles.picker}
                  onValueChange={setConjoint}
                  enabled={!!gender}
                  dropdownIconColor={gender ? "white" : "#6B7280"}
                >
                  {renderPickerItems(getConjointOptions(), "--Aucun--")}
                </Picker>
              </View>
              {gender && getConjointOptions().length === 0 && (
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
                <View>
                  <Text style={styles.label}>Date de décès</Text>
                  <TextInput
                    style={styles.textInput}
                    value={date_deces}
                    onChangeText={setDateDeces}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.fullWidthContainer}>
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
        </View>

        {/* Boutons d'action */}
        <View style={styles.buttonContainer}>
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
        </View>
      </View>
    </ScrollView>
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
    marginBottom: 4,
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
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#374151",
    borderWidth: 1,
    borderColor: "#06B6D4",
    borderRadius: 6,
    overflow: "hidden",
  },
  picker: {
    color: "white",
    backgroundColor: "#374151",
    height: 50,
  },
  disabledPicker: {
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