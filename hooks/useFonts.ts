// hooks/useFonts.ts
import { useFonts } from 'expo-font';

export function useCustomFonts() {
  return useFonts({
    'Geist-Regular': require('../assets/fonts/Geist-Regular.ttf'),
    'Geist-Mono': require('../assets/fonts/GeistMono-Regular.ttf'),
  });
}
