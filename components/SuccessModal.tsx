import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  Animated, 
} from 'react-native';
import { Feather } from '@expo/vector-icons';


// Types
type ModalType = 'connexion' | 'inscription';

interface SuccessModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  type: ModalType;
}

// Types pour les messages
type Messages = {
  [key in ModalType]: string[];
};

type Titres = {
  [key in ModalType]: string;
};

const SuccessModal: React.FC<SuccessModalProps> = ({ showModal, setShowModal, type }) => {
  const progress = useRef(new Animated.Value(0)).current;

  const titre: Titres = {
    connexion: "Connexion réussie !",
    inscription: "Inscription réussie !",
  };

  const messages: Messages = {
    connexion: [
      "Bienvenue !",
      "Vous êtes bien connecté à votre compte.",
    ],
    inscription: [
      "Félicitations !",
      "Votre inscription a été effectuée avec succès.",
    ],
  };

  useEffect(() => {
    if (showModal) {
      Animated.timing(progress, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();
    } else {
      progress.setValue(0);
    }
  }, [showModal, progress]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{titre[type] || "Opération réussie !"}</Text>
          <Text style={styles.description}>
            {messages[type]?.[0]}{'\n'}
            {messages[type]?.[1]}
          </Text>

          <View style={styles.iconContainer}>
            <View style={styles.iconWrapper}>
              <Feather name="check-circle" size={48} color="#D97706" />
            </View>
          </View>

          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#FEF3C7', // amber-50
    borderRadius: 12,
    padding: 24,
    borderColor: '#FDE68A',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#374151', // gray-700
    textAlign: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    backgroundColor: '#FCD34D', // amber-100
    padding: 12,
    borderRadius: 999,
    elevation: 2,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6', // gray-100
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B', // amber-500
  },
});

export default SuccessModal;