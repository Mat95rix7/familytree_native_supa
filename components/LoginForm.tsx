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
import SuccessModal from './SuccessModal';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorAuth, setErrorAuth] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { login } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError("Format d'email invalide");
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorAuth('');

    if (!validateEmail(email)) {
      setEmailError('Veuillez saisir un email valide');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorAuth('Le mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    try {
      const data = await login(email, password);

      if (!data) {
        setErrorAuth('Identifiants invalides');
        return;
      }

      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        router.push('/');
      }, 2000);
    } catch (error: any) {
      setErrorAuth(error?.code || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Connexion</Text>

      <TextInput
        style={[styles.input, emailError && styles.inputError]}
        placeholder="Adresse email"
        placeholderTextColor="#9CA3AF"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={handleEmailChange}
      />
      {emailError !== '' && (
        <Text style={styles.errorText}>{emailError}</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {errorAuth !== '' && (
        <Text style={styles.errorText}>{errorAuth}</Text>
      )}

      <TouchableOpacity
        style={[styles.button, (isLoading || emailError) && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading || !!emailError}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Se connecter</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.bottomText}>
        Vous n’avez pas de compte ?
        <Text
          onPress={() => router.push('/auth/register')}
          style={styles.linkText}
        >
          {' '}Inscrivez-Vous
        </Text>
      </Text>

      <SuccessModal showModal={showModal} setShowModal={setShowModal} type="connexion" />
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
    color: '#f59e0b', // amber-500
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
  errorText: {
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
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    color: '#fff',
  },
  linkText: {
    color: '#fbbf24',
    fontWeight: 'bold',
  },
});

export default LoginForm;
