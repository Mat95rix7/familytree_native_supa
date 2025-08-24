import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { validateField } from '../services/errorMessages';
import SuccessModal from './SuccessModal';

const RegisterForm = () => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async () => {
    const newErrors: any = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const data = await register(formData.email, formData.password, formData.username);

      if (data?.success) {
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          router.push('/'); 
        }, 2000);
      }
    } catch (error) {
      console.error('Inscription échouée :', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>

      <TextInput
        style={[styles.input, errors.username && styles.inputError]}
        placeholder="Nom d'utilisateur"
        value={formData.username}
        onChangeText={value => handleChange('username', value)}
      />
      {errors.username !== '' && <Text style={styles.error}>{errors.username}</Text>}

      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={value => handleChange('email', value)}
      />
      {errors.email !== '' && <Text style={styles.error}>{errors.email}</Text>}

      <TextInput
        style={[styles.input, errors.password && styles.inputError]}
        placeholder="Mot de passe"
        secureTextEntry
        value={formData.password}
        onChangeText={value => handleChange('password', value)}
      />
      {errors.password !== '' && <Text style={styles.error}>{errors.password}</Text>}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Inscription</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Vous avez déjà un compte ?{' '}
        <Text style={styles.link} onPress={() => router.push('/auth/login')}>
          Connectez-vous
        </Text>
      </Text>

      <SuccessModal
        showModal={showModal}
        setShowModal={setShowModal}
        type="inscription"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
    color: '#f59e0b',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    padding: 16,
    fontSize: 16,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    color: '#6b7280',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  error: {
    textAlign: 'center',
    color: '#f59e0b',
    fontSize: 14,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    color: '#fff',
  },
  link: {
    color: '#fbbf24',
    fontWeight: 'bold',
  },
});

export default RegisterForm;
