/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import { Image, ImageBackground, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/theme/ThemeProvider';
import AppNavigator from './src/navigation/AppNavigator';
import AuthProvider from './src/context/AuthContext';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import CountryProvider from './src/context/Country';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { setCountry } from './src/utility/helpers';
import Toast from "react-native-toast-message"
import { MenuProvider } from "react-native-popup-menu"

function App() {

  const isDarkMode = useColorScheme() === 'dark';
  useCallback(setCountry, [])

  return (
    <SafeAreaView style={[styles.background]}>
      <ImageBackground source={require('./src/assets/app_bg.jpg')} style={[styles.background]} resizeMode='cover'>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <MenuProvider>
            <ThemeProvider>
              <AuthProvider>
                <CountryProvider>
                  <BottomSheetModalProvider>
                    <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
                    <AppNavigator />
                  </BottomSheetModalProvider>
                </CountryProvider>
              </AuthProvider>
            </ThemeProvider>
          </MenuProvider>
        </GestureHandlerRootView>
      </ImageBackground>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: 'center',
  }
})


export default App;
