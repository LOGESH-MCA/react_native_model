import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useGrocery } from '../context/GroceryContext';

// Components
import TabNavigator from './TabNavigator';
import CustomDrawer from './CustomDrawer';
import FavoritesScreen from '../screens/FavoritesScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

/**
 * Drawer Navigation (10 Marks - Part II)
 * 
 * Explanation for Viva:
 * - `createDrawerNavigator` provides a slide-out sidebar menu accessible via
 *   the hamburger menu icon on the top header.
 * - Uses a custom drawer component (`CustomDrawer`) that displays the user profile,
 *   name, email and role indicator (no profile picture).
 * - When role is Customer: provides links to Groceries, Favorites, Cart, Profile.
 * - When role is Admin: Cart is omitted (per requirement: 'my cart is not needed for admin')
 *   and replaced with the Admin Inventory Dashboard.
 */

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const { user } = useGrocery();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: COLORS.primary,
        drawerActiveTintColor: COLORS.textDark,
        drawerInactiveTintColor: COLORS.textMedium,
        drawerLabelStyle: {
          fontSize: 14,
          fontWeight: '700',
          marginLeft: -10,
        },
        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 12,
          marginVertical: 4,
          paddingVertical: 2,
        },
      }}
    >
      {/* 1. Main Tab Screen (Hosts Bottom Tabs) */}
      <Drawer.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          drawerLabel: 'Daily Groceries',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="basket-outline" size={20} color={color} />
          ),
        }}
      />

      {/* Customer Drawer Items */}
      {user.role === 'Customer' ? (
        <>
          <Drawer.Screen
            name="DrawerFavorites"
            component={FavoritesScreen}
            options={{
              drawerLabel: 'My Favorites',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="heart-outline" size={20} color={COLORS.accentRed} />
              ),
            }}
          />

          <Drawer.Screen
            name="DrawerCart"
            component={CartScreen}
            options={{
              drawerLabel: 'My Shopping Cart',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="cart-outline" size={20} color={color} />
              ),
            }}
          />

          <Drawer.Screen
            name="DrawerProfile"
            component={ProfileScreen}
            options={{
              drawerLabel: 'Customer Profile',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={20} color={color} />
              ),
            }}
          />
        </>
      ) : (
        /* Admin Drawer Items */
        <Drawer.Screen
          name="DrawerAdminDashboard"
          component={AdminDashboardScreen}
          options={{
            drawerLabel: 'Admin Dashboard',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="shield-checkmark-outline" size={20} color={color} />
            ),
          }}
        />
      )}
    </Drawer.Navigator>
  );
}
