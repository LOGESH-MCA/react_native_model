import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { useGrocery } from '../context/GroceryContext';

// Tab icon with the red indicator line above the active tab (Figma bottom bar)
function TabIcon({ focused, name, activeColor = COLORS.textDark }) {
  return (
    <View style={styles.iconWrap}>
      {focused && <View style={styles.activeIndicator} />}
      <Ionicons name={name} size={24} color={focused ? activeColor : COLORS.textMedium} />
    </View>
  );
}

// Screens
import ProductsListScreen from '../screens/ProductsListScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import OrdersScreen from '../screens/OrdersScreen';

/**
 * Tab Navigation (10 Marks - Part II)
 * 
 * Explanation for Viva:
 * - `createBottomTabNavigator` creates the bottom navigation bar.
 * - For Customer:
 *    1. HomeTab (Daily Groceries)
 *    2. FavoritesTab (My Favorites with live count badge)
 *    3. CartTab (My Cart with real-time total quantity badge)
 *    4. ProfileTab (Customer Profile & Edit Profile)
 * - For Admin (per user requirement: "my cart is not needed for admin"):
 *    1. HomeTab (Daily Groceries)
 *    2. AdminDashboardTab (Inventory & Stock Control)
 * - ScreenOptions customize the active/inactive icons and color theme.
 */

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { user, cartCount, favorites } = useGrocery();
  // Bottom inset = height of the phone's own navigation bar (buttons / gesture bar)
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // Hide the tab bar while typing so it never sits on top of the keyboard
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: COLORS.textDark,
        tabBarInactiveTintColor: COLORS.textMedium,
        tabBarStyle: [
          styles.tabBar,
          { height: 64 + insets.bottom, paddingBottom: insets.bottom + 8 },
        ],
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      {/* 1. Products List Screen (Admin and Customer) */}
      <Tab.Screen
        name="HomeTab"
        component={ProductsListScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name={focused ? 'home' : 'home-outline'} activeColor={COLORS.textDark} />
          ),
        }}
      />

      {/* If Customer: Show Favorites, Cart, Profile */}
      {user.role === 'Customer' ? (
        <>
          {/* 2. Add Favorite Screen (only Customer) */}
          <Tab.Screen
            name="FavoritesTab"
            component={FavoritesScreen}
            options={{
              tabBarLabel: 'Favourite',
              tabBarBadge: favorites.length > 0 ? favorites.length : undefined,
              tabBarBadgeStyle: styles.badge,
              tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name={focused ? 'heart' : 'heart-outline'} activeColor={COLORS.accentRed} />
          ),
            }}
          />

          {/* 3. My Cart Screen (only Customer, not needed for Admin) */}
          <Tab.Screen
            name="CartTab"
            component={CartScreen}
            options={{
              tabBarLabel: 'My Cart',
              tabBarBadge: cartCount > 0 ? cartCount : undefined,
              tabBarBadgeStyle: styles.badge,
              tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name={focused ? 'cart' : 'cart-outline'} activeColor={COLORS.textDark} />
          ),
            }}
          />

          {/* 4. Profile & Edit Profile Screen (only Customer) */}
          <Tab.Screen
            name="ProfileTab"
            component={ProfileScreen}
            options={{
              tabBarLabel: 'Profile',
              tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name={focused ? 'person' : 'person-outline'} activeColor={COLORS.textDark} />
          ),
            }}
          />
        </>
      ) : (
        /* If Admin: Show Admin Dashboard / Inventory and all customer Orders instead of Cart */
        <>
          <Tab.Screen
            name="AdminDashboardTab"
            component={AdminDashboardScreen}
            options={{
              tabBarLabel: 'Dashboard',
              tabBarIcon: ({ focused }) => (
                <TabIcon focused={focused} name={focused ? 'stats-chart' : 'stats-chart-outline'} />
              ),
            }}
          />
          <Tab.Screen
            name="AdminOrdersTab"
            component={OrdersScreen}
            options={{
              tabBarLabel: 'Orders',
              tabBarIcon: ({ focused }) => (
                <TabIcon focused={focused} name={focused ? 'receipt' : 'receipt-outline'} />
              ),
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.tabBar,
    borderTopWidth: 0,
    paddingTop: 6,
    elevation: 0,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  activeIndicator: {
    position: 'absolute',
    top: -6,
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.accentRed,
  },
  badge: {
    backgroundColor: COLORS.accentRed,
    color: COLORS.textWhite,
    fontSize: 10,
    fontWeight: '800',
  },
});
