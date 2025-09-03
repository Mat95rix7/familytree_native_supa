import React from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View} from 'react-native';
import LoginForm from '../../components/LoginForm';

const LoginPage = () => {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior='height'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={styles.loginBox}>
            <LoginForm />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1f2937',
  },
  loginBox: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 20,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#4b5563',
    transform: [{ scale: 1 }],
  },
});

export default LoginPage;
