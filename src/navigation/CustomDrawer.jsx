import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { useGrocery } from '../context/GroceryContext';

/**
 * Custom Drawer Content
 * 
 * Explanation for Viva:
 * - This component renders the slide-out sidebar menu (Drawer Navigation).
 * - Shows the active user's name, email and role badge (Customer / Admin), no profile picture.
 * - Provides a one-tap button to toggle between Customer and Admin roles.
 * - Displays a Sign Out button that navigates back to the Home authentication screen.
 */

export default function CustomDrawer(props) {
  const insets = useSafeAreaInsets();
  const { user, logout, cartCount, favorites } = useGrocery();

  // Logout handler
  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Do you want to log out of Daily Grocery?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          logout();
          props.navigation.replace('Home');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
        {/* User Profile Header in Drawer */}
        <View style={styles.userHeader}>
          <View style={styles.userTextInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user.email}
            </Text>
            {/* Role Badge */}
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor:
                    user.role === 'Admin' ? '#FFE57F' : COLORS.secondaryLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.roleBadgeText,
                  {
                    color:
                      user.role === 'Admin' ? '#856404' : COLORS.secondary,
                  },
                ]}
              >
                ● {user.role} Mode
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.drawerDivider} />

        {/* Standard Drawer navigation items */}
        <DrawerItemList {...props} />

        {/* Quick Navigation Shortcuts */}
        <View style={styles.quickShortcuts}>
          <Text style={styles.shortcutsTitle}>QUICK STATS</Text>

          <View style={styles.statRow}>
            <View style={styles.statIconName}>
              <Ionicons name="heart" size={16} color={COLORS.accentRed} />
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <Text style={styles.statValue}>{favorites.length} items</Text>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statIconName}>
              <Ionicons name="cart" size={16} color={COLORS.secondary} />
              <Text style={styles.statLabel}>Cart Items</Text>
            </View>
            <Text style={styles.statValue}>{cartCount} items</Text>
          </View>
        </View>
      </DrawerContentScrollView>

      {/* Footer with App Info and Logout */}
      <View style={[styles.drawerFooter, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>Daily Grocery App v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  drawerScroll: {
    paddingTop: 10,
  },
  userHeader: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  userTextInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  userEmail: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  switchRoleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 8,
  },
  switchRoleText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  quickShortcuts: {
    paddingHorizontal: 18,
    marginTop: 14,
    gap: 10,
  },
  shortcutsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 0.8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statIconName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textMedium,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
    gap: 10,
    backgroundColor: COLORS.cardBackground,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.error,
  },
  versionText: {
    fontSize: 10,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
