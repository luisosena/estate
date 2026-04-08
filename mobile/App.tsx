import { NavigationContainer } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SplashScreen } from './src/components/SplashScreen';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';

// Custom theme - Sophisticated Deep Teal & Gold (accessibility optimized)
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0f4c4c',    // Deep Teal - lighter for better contrast
    secondary: '#d4a853',  // Rich Gold
    tertiary: '#c46d5e',   // Terracotta
    error: '#c75146',      // Muted Red
    background: '#faf8f5', // Warm cream
    surface: '#ffffff',
    surfaceVariant: '#f0ebe5',
    onPrimary: '#ffffff',
    onSecondary: '#1a1a1a',
    onBackground: '#1a1a1a',
    onSurface: '#1a1a1a',
  },
};

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>

      {/* Render Splash Screen on top of the app as an absolute overlay */}
      {isSplashVisible && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]}>
          <SplashScreen onFinish={() => setIsSplashVisible(false)} />
        </View>
      )}
    </GestureHandlerRootView>
  );
}
