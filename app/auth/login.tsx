import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import LoginForm from '../../components/LoginForm';

const { height } = Dimensions.get('window');

const LoginPage = () => {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <View style={styles.loginBox}>
          <LoginForm />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: height,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1f2937', // Equivalent to dark gray background
  },
  loginBox: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#4b5563', // Gray-700
    transform: [{ scale: 1 }],
  },
});

export default LoginPage;
