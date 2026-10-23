import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Context Provider
import { GroceryProvider } from './src/context/GroceryContext';

// Top-Level Navigator
import RootNavigator from './src/navigation/RootNavigator';

/**
 * Main Application Root (App.js)
 * 
 * Explanation for Viva:
 * - `GestureHandlerRootView`: Enables gesture handling for Drawer and Stack transitions.
 * - `SafeAreaProvider`: Ensures UI elements render within safe device boundaries (avoiding camera notches & home indicators).
 * - `GroceryProvider`: Our custom Context API provider supplying cart, favorites, and user state globally.
 * - `NavigationContainer`: The root container managing navigation tree and navigation state.
 * - `RootNavigator`: Combines Stack, Tabs, and Drawer navigations into a coherent, responsive app.
 */

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <GroceryProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </GroceryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
