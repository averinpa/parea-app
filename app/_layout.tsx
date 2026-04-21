import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  useFonts({
    'ClashDisplay-Regular':  require('../assets/Fonts/ClashDisplay-Regular.otf'),
    'ClashDisplay-Medium':   require('../assets/Fonts/ClashDisplay-Medium.otf'),
    'ClashDisplay-Semibold': require('../assets/Fonts/ClashDisplay-Semibold.otf'),
    'ClashDisplay-Bold':     require('../assets/Fonts/ClashDisplay-Bold.otf'),
    'Outfit-Regular':   require('@expo-google-fonts/outfit/400Regular/Outfit_400Regular.ttf'),
    'Outfit-Medium':    require('@expo-google-fonts/outfit/500Medium/Outfit_500Medium.ttf'),
    'Outfit-SemiBold':  require('@expo-google-fonts/outfit/600SemiBold/Outfit_600SemiBold.ttf'),
    'Outfit-Bold':      require('@expo-google-fonts/outfit/700Bold/Outfit_700Bold.ttf'),
  });

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
