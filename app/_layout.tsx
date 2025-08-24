// app/_layout.tsx
import { Stack } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Navbar from '../components/Navbar';
import { AuthProvider } from '../context/AuthContext';

import { useFonts } from 'expo-font';

export default function RootLayout() {

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }
  return (
      <SafeAreaProvider>
        <AuthProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <Navbar />
            <Stack screenOptions={{ headerShown: false }} />
          </SafeAreaView>
        </AuthProvider>
      </SafeAreaProvider>
  );
}
    