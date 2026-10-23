import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { COLORS, SHADOW } from '../theme/colors';

/**
 * Shared UI building blocks
 *
 * Explanation for Viva:
 * - `ScreenBackground`: the green-to-cream gradient used behind every screen in the Figma design.
 * - `IconButton`: the rounded square header button (back, search, heart, menu).
 * - `ScreenHeader`: title centred between two IconButtons, respecting the phone notch.
 */

// Space needed at the bottom of a screen so content is not hidden behind the phone's
// navigation bar. Inside the bottom tabs the tab bar already handles it, so it returns 0.
export function useBottomSpace() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useContext(BottomTabBarHeightContext);
  return tabBarHeight ? 0 : insets.bottom;
}

export function ScreenBackground({ children, style }) {
  return (
    <LinearGradient
      colors={[COLORS.gradientTop, COLORS.gradientBottom]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.5, y: 0.55 }}
      style={[styles.flex, style]}
    >
      {children}
    </LinearGradient>
  );
}

export function IconButton({ icon, onPress, color = COLORS.textDark, size = 24, badge, style }) {
  return (
    <TouchableOpacity style={[styles.iconButton, style]} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={size} color={color} />
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function ScreenHeader({ title, left, right }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      {left || <View style={styles.placeholder} />}
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      {right || <View style={styles.placeholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 2,
    borderColor: COLORS.iconButtonBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.accentRed,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.textWhite,
    fontSize: 10,
    fontWeight: '800',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    marginHorizontal: 8,
  },
  placeholder: {
    width: 52,
  },
});
