import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import RegisterForm from '../../components/RegisterForm';

const { height } = Dimensions.get('window');

const RegisterPage = () => {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <View style={styles.registerBox}>
          <RegisterForm />
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
    backgroundColor: '#1f2937', // Equivalent to gray-800
  },
  registerBox: {
    backgroundColor: '#1e1e1e', // to mimic the gradient-to-b from gray-800 to gray-900
    padding: 20,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#4b5563', // gray-700
    transform: [{ scale: 1 }],
  },
});

export default RegisterPage;
