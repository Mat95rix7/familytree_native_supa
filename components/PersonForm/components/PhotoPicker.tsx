import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, Animated, Modal, TouchableWithoutFeedback } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Trash2, Edit3, X } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import { ImageAsset } from '../types';

interface PhotoPickerProps {
  photo: ImageAsset | null;
  onPhotoSelect: (photo: ImageAsset | null) => void;
  label?: string;
}

export function PhotoPicker({ photo, onPhotoSelect, label = "Photo" }: PhotoPickerProps) {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [showOptions, setShowOptions] = useState(false);

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const convertAssetToFile = async (asset: {
    uri: string;
    name: string;
    type?: string;
    size?: number;
  }): Promise<ImageAsset> => {
    const fileInfo = await FileSystem.getInfoAsync(asset.uri, { size: true });
    const size = fileInfo.size ?? asset.size ?? 0;
    return {
      uri: asset.uri,
      name: asset.name,
      type: asset.type || 'image/jpeg',
      size,
    };
  };

  const pickImageFromLibrary = async (): Promise<void> => {
    setShowOptions(false); // Ferme la modal immédiatement
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission requise", "L'accès à la galerie est nécessaire pour sélectionner une photo");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        // ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const assetData = result.assets[0];
        const fileAsset = await convertAssetToFile({
          uri: assetData.uri,
          type: assetData.mimeType || 'image/jpeg',
          name: assetData.fileName || `image_${Date.now()}.jpg`,
          size: assetData.fileSize || 0,
        });
        onPhotoSelect(fileAsset);
      }
    } catch (error: any) {
      Alert.alert("Erreur", `Impossible de sélectionner une photo: ${error.message || error}`);
    }
  };

  const takePhotoWithCamera = async (): Promise<void> => {
    setShowOptions(false); // Ferme la modal immédiatement
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission requise", "L'accès à la caméra est nécessaire pour prendre une photo");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        mediaTypes: ['images'],
        // ImagePicker.MediaTypeOptions.Images,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const assetData = result.assets[0];
        const fileAsset = await convertAssetToFile({
          uri: assetData.uri,
          type: assetData.mimeType || 'image/jpeg',
          name: assetData.fileName || `photo_${Date.now()}.jpg`,
          size: assetData.fileSize || 0,
        });
        onPhotoSelect(fileAsset);
      }
    } catch (error: any) {
      Alert.alert("Erreur", `Impossible de prendre une photo: ${error.message || error}`);
    }
  };

  const confirmRemovePhoto = () => {
    Alert.alert(
      "Supprimer la photo",
      "Êtes-vous sûr de vouloir supprimer cette photo ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => onPhotoSelect(null)
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {photo ? (
        <Animated.View style={[styles.photoContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.photoFrame}>
            <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
            <View style={styles.photoOverlay}>
              <View style={styles.photoInfo}>
                <Text style={styles.photoSize}>
                  {photo.size ? `${Math.round(photo.size / 1024)} KB` : 'Taille inconnue'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.photoActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => { animatePress(); setShowOptions(true); }}
              activeOpacity={0.8}
            >
              <Edit3 color="#06B6D4" size={16} />
              <Text style={styles.actionButtonText}>Modifier</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={confirmRemovePhoto}
              activeOpacity={0.8}
            >
              <Trash2 color="#EF4444" size={16} />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => { animatePress(); setShowOptions(true); }}
            activeOpacity={0.8}
          >
            <View style={styles.uploadIconContainer}>
              <ImageIcon color="#06B6D4" size={32} strokeWidth={1.5} />
              <Camera color="#67E8F9" size={20} style={styles.cameraIcon} />
            </View>

            <View style={styles.uploadTextContainer}>
              <Text style={styles.uploadTitle}>Ajouter une photo</Text>
              <Text style={styles.uploadSubtitle}>
                Touchez pour choisir depuis la galerie ou prendre une photo
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      <Modal
        visible={showOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
        statusBarTranslucent={true}
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowOptions(false)}>
            <View style={styles.modalBackground} />
          </TouchableWithoutFeedback>

          <View style={styles.optionsContainer}>
            <View style={styles.optionsHeader}>
              <Text style={styles.optionsTitle}>📸 Choisir une photo</Text>
              <TouchableOpacity
                onPress={() => setShowOptions(false)}
                style={styles.closeButton}
              >
                <X color="#9CA3AF" size={20} />
              </TouchableOpacity>
            </View>

            <Text style={styles.optionsSubtitle}>
              Comment souhaitez-vous ajouter votre photo ?
            </Text>

            <View style={styles.optionsButtons}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={takePhotoWithCamera}
                activeOpacity={0.8}
              >
                <View style={styles.optionIconContainer}>
                  <Camera color="#06B6D4" size={24} />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Caméra</Text>
                  <Text style={styles.optionDescription}>Prendre une nouvelle photo</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={pickImageFromLibrary}
                activeOpacity={0.8}
              >
                <View style={styles.optionIconContainer}>
                  <ImageIcon color="#67E8F9" size={24} />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Galerie</Text>
                  <Text style={styles.optionDescription}>Choisir depuis vos photos</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowOptions(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  label: {
    color: "#67E8F9",
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  uploadButton: {
    backgroundColor: "rgba(31, 41, 55, 0.6)",
    borderWidth: 2,
    borderColor: "#06B6D4",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    minHeight: 120,
  },
  uploadIconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraIcon: {
    position: "absolute",
    bottom: -8,
    right: -8,
    backgroundColor: "#111827",
    borderRadius: 10,
    padding: 2,
  },
  uploadTextContainer: {
    alignItems: "center",
    gap: 4,
  },
  uploadTitle: {
    color: "#E5E7EB",
    fontSize: 16,
    fontWeight: "600",
  },
  uploadSubtitle: {
    color: "#9CA3AF",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  photoContainer: {
    alignItems: "center",
    gap: 16,
  },
  photoFrame: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  photoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 8,
  },
  photoInfo: {
    alignItems: "center",
  },
  photoSize: {
    color: "#E5E7EB",
    fontSize: 10,
    fontWeight: "500",
  },
  photoActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
  },
  deleteButton: {
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  actionButtonText: {
    color: "#06B6D4",
    fontSize: 14,
    fontWeight: "500",
  },
  deleteButtonText: {
    color: "#EF4444",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  optionsContainer: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 340,
    borderWidth: 2,
    borderColor: "#06B6D4",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    zIndex: 10000,
  },
  optionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  optionsTitle: {
    color: "#67E8F9",
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: "rgba(156, 163, 175, 0.1)",
  },
  optionsSubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  optionsButtons: {
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    padding: 16,
    borderRadius: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(75, 85, 99, 0.5)",
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.2)",
  },
  optionTextContainer: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    color: "#E5E7EB",
    fontSize: 16,
    fontWeight: "600",
  },
  optionDescription: {
    color: "#9CA3AF",
    fontSize: 12,
    lineHeight: 16,
  },
  cancelButton: {
    backgroundColor: "rgba(75, 85, 99, 0.3)",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(75, 85, 99, 0.5)",
  },
  cancelButtonText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
});