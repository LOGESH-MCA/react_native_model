import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import DrawerNavigator from './DrawerNavigator';
import CheckoutAddressScreen from '../screens/CheckoutAddressScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import OrdersScreen from '../screens/OrdersScreen';

/**
 * Stack Navigation (10 Marks - Part II)
 * 
 * Explanation for Viva:
 * - `createStackNavigator` manages the top-level navigation flow using a screen stack (LIFO - Last In, First Out).
 * - Flows:
 *    1. 'Home' screen: Initial authentication & onboarding screen.
 *    2. 'AppDrawer': Main application screen containing the Drawer & Tab navigators.
 *    3. 'ProductDetails': Deep-level screen pushed onto the stack when user taps on any grocery product.
 * - This completes the required trio of navigators:
 *    Stack Navigator (10 Marks) + Tab Navigator (10 Marks) + Drawer Navigator (10 Marks) = 30 Marks.
 */

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        // Web only: keep every screen exactly the window height so each screen's own
        // ScrollView scrolls (otherwise the stack lets pages grow past the window)
        headerMode: 'float',
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      {/* 1. Home Screen (Sign Up & Sign In for Admin and Customer) */}
      <Stack.Screen name="Home" component={HomeScreen} />

      {/* 2. Main App (Hosts Drawer & Bottom Tabs) */}
      <Stack.Screen name="AppDrawer" component={DrawerNavigator} />

      {/* 3. Product Details Screen (Stack push with back button) */}
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />

      {/* 4. Checkout flow: Address -> Razorpay Payment -> Order Placed */}
      <Stack.Screen name="Checkout" component={CheckoutAddressScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      {/* 5. Customer order history (Profile -> My Orders) */}
      <Stack.Screen name="MyOrders" component={OrdersScreen} />

      <Stack.Screen
        name="OrderSuccess"
        component={OrderSuccessScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
