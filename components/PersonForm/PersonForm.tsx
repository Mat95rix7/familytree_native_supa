import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

import { PersonFormProps } from './types';
import { usePersonForm } from './hooks/usePersonForm';
import { usePersonsData } from './hooks/usePersonsData';
import { FormSection } from './components/FormSection';
import { PersonDropdown } from './components/PersonDropdown';
import { PhotoPicker } from './components/PhotoPicker';
import { FormButtons } from './components/FormButtons';
import { ErrorDisplay } from './components/ErrorDisplay';
import { validatePersonForm, convertDateFormat } from './utils/formValidation';
import { apiFetch } from "../../services/FetchAPI";

export default function PersonForm({ 
  initialData = null, 
  mode = "add",
  onSuccess = null 
}: PersonFormProps): JSX.Element {
  const router = useRouter();
  
  const {
    formData,
    updateField,
    resetForm,
    showDateDeces,
    setShowDateDeces,
    loading,
    setLoading,
    errors,
    setErrors,
  } = usePersonForm(initialData);

  const {
    persons,
    genderItems,
    fatherItems,
    motherItems,
    conjointItems,
    loading: personsLoading,
    error: personsError,
  } = usePersonsData(initialData || undefined, mode);

  // Dropdown states
  const [dropdownStates, setDropdownStates] = useState({
    gender: false,
    father: false,
    mother: false,
    conjoint: false,
  });

  const closeOtherDropdowns = (exceptDropdown: string) => {
    setDropdownStates(prev => ({
      gender: exceptDropdown === 'gender' ? prev.gender : false,
      father: exceptDropdown === 'father' ? prev.father : false,
      mother: exceptDropdown === 'mother' ? prev.mother : false,
      conjoint: exceptDropdown === 'conjoint' ? prev.conjoint : false,
    }));
  };

  const updateDropdownState = (dropdown: string, isOpen: boolean) => {
    if (isOpen) {
      closeOtherDropdowns(dropdown);
    }
    setDropdownStates(prev => ({ ...prev, [dropdown]: isOpen }));
  };

  const handleSubmit = async (): Promise<void> => {
    const validation = validatePersonForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const submissionData = new FormData();
      
      // Basic data
      submissionData.append("first_name", formData.first_name);
      submissionData.append("last_name", formData.last_name);
      submissionData.append("gender", formData.gender);
      submissionData.append("birth_place", formData.birth_place);
      submissionData.append("notes", formData.notes);

      // Convert and append birth date
      submissionData.append("birth_date", convertDateFormat(formData.birth_date));

      // Family relations
      if (formData.father && formData.father !== "") {
        submissionData.append("fatherId", formData.father);
      }
      if (formData.mother && formData.mother !== "") {
        submissionData.append("motherId", formData.mother);
      }
      if (formData.conjoint && formData.conjoint !== "") {
        submissionData.append("conjointId", formData.conjoint);
      }

      // Death date
      if (formData.date_deces) {
        submissionData.append("dateDeces", convertDateFormat(formData.date_deces));
      }

      // Photo handling
      if (formData.photo?.uri) {
        const fileSize = formData.photo.size; // taille en octets
        const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
        console.log(fileSize);

        if (fileSize && fileSize > MAX_SIZE) {
          // Ici, on informe le client avec un message clair
          alert("La photo est trop grande. Veuillez choisir un fichier de moins de 5 Mo.");
          return;
        } else {
          const name = formData.photo.name || `photo.${formData.photo.uri.split('.').pop()}`;
          const type = formData.photo.type || "image/jpeg";
          submissionData.append("photo", { uri: formData.photo.uri, type, name } as any);
        }
      }

      const url = mode === "edit" ? `/personnes/${initialData?.id}/` : "/personnes/";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await apiFetch(url, {
        method: method,
        body: submissionData,
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
      setErrors([`Erreur lors de ${mode === "edit" ? "la modification" : "l'ajout"}`]);
    } finally {
      setLoading(false);
    }
  };

  if (personsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
    >
      <Animated.View 
        entering={FadeIn.duration(500)} 
        style={styles.formContainer}
      >
        {/* Title */}
        <Animated.View entering={SlideInDown.delay(100)} style={styles.headerContainer}>
          <Text style={styles.title}>
            {mode === "edit" ? "Modifier une personne" : "Ajouter une personne"}
          </Text>
        </Animated.View>

        {/* Error Display */}
        <ErrorDisplay errors={errors} />

        {/* Identity Section */}
        <FormSection title="Identité" emoji="👤" delay={200}>
          {/* Name and First Name */}
          <View style={styles.rowContainer}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Nom *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.last_name}
                onChangeText={(value) => updateField('last_name', value)}
                placeholder="Nom de famille"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Prénom *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.first_name}
                onChangeText={(value) => updateField('first_name', value)}
                placeholder="Prénom"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Birth date and place */}
          <View style={styles.rowContainer}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Date de naissance *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.birth_date}
                onChangeText={(value) => updateField('birth_date', value)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Lieu de naissance</Text>
              <TextInput
                style={styles.textInput}
                value={formData.birth_place}
                onChangeText={(value) => updateField('birth_place', value)}
                placeholder="Lieu de naissance"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Gender and Photo */}
          <View style={styles.rowContainer}>
            <PersonDropdown
              label="Sexe *"
              value={formData.gender}
              items={genderItems}
              open={dropdownStates.gender}
              onOpen={(open) => updateDropdownState('gender', open)}
              onValueChange={(callback) => {
                const newValue = typeof callback === 'function' ? callback(formData.gender) : callback;
                updateField('gender', newValue);
              }}
              onItemsChange={() => {}} // Gender items are static
              searchable={false}
              zIndex={1000}
            />

          </View>            
          <PhotoPicker
              photo={formData.photo}
              onPhotoSelect={(photo) => updateField('photo', photo)}
            />
        </FormSection>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Family Section */}
        <FormSection title="Famille et relations" emoji="👥" delay={300}>
          {/* Father and Mother */}
          <View style={styles.rowContainer}>
            <PersonDropdown
              label="Père"
              value={formData.father}
              items={fatherItems}
              open={dropdownStates.father}
              onOpen={(open) => updateDropdownState('father', open)}
              onValueChange={(callback) => {
                const newValue = typeof callback === 'function' ? callback(formData.father) : callback;
                updateField('father', newValue);
              }}
              onItemsChange={() => {}} // Items are managed by hook
              placeholder="--Aucun--"
              zIndex={900}
            />
            <PersonDropdown
              label="Mère"
              value={formData.mother}
              items={motherItems}
              open={dropdownStates.mother}
              onOpen={(open) => updateDropdownState('mother', open)}
              onValueChange={(callback) => {
                const newValue = typeof callback === 'function' ? callback(formData.mother) : callback;
                updateField('mother', newValue);
              }}
              onItemsChange={() => {}} // Items are managed by hook
              placeholder="--Aucune--"
              zIndex={800}
            />
          </View>

          {/* Spouse and Death Date */}
          <View style={styles.rowContainer}>
            <PersonDropdown
              label="Conjoint"
              value={formData.conjoint}
              items={conjointItems}
              open={dropdownStates.conjoint}
              onOpen={(open) => updateDropdownState('conjoint', open)}
              onValueChange={(callback) => {
                const newValue = typeof callback === 'function' ? callback(formData.conjoint) : callback;
                updateField('conjoint', newValue);
              }}
              onItemsChange={() => {}} // Items are managed by hook
              placeholder="--Aucun(e)--"
              disabled={!formData.gender}
              helperText={formData.gender && conjointItems.length <= 1 ? 
                `Aucun ${formData.gender === "Homme" ? "femme" : "homme"} disponible` : undefined}
              zIndex={700}
            />
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
                    value={formData.date_deces}
                    onChangeText={(value) => updateField('date_deces', value)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                  />
                </Animated.View>
              )}
            </View>
          </View>
        </FormSection>

        {/* Notes */}
        <Animated.View entering={SlideInDown.delay(400)} style={styles.fullWidthContainer}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.notes}
            onChangeText={(value) => updateField('notes', value)}
            placeholder="Notes additionnelles..."
            placeholderTextColor="#9CA3AF"
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Animated.View>

        {/* Action Buttons */}
        <FormButtons
          loading={loading}
          mode={mode}
          onSubmit={handleSubmit}
          onReset={mode === "add" ? resetForm : undefined}
          disabled={errors.length > 0}
        />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#111827",
  },
  loadingText: {
    color: "#67E8F9",
    fontSize: 18,
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
    fontSize: 20,
  },
  textInput: {
    backgroundColor: "#374151",
    borderWidth: 1,
    borderColor: "#06B6D4",
    borderRadius: 6,
    padding: 12,
    color: "white",
    fontSize: 20,
    minHeight: 50,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
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
  separator: {
    height: 1,
    backgroundColor: "#0891B2",
    marginVertical: 24,
  },
});