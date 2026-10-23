import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '../theme/colors';
import { ScreenBackground, useBottomSpace } from '../components/UI';
import { KeyboardAwareOverlay, KeyboardInput } from '../components/KeyboardAware';
import { useGrocery } from '../context/GroceryContext';
import { isValidEmail, isValidPhone, isNonEmpty } from '../utils/validation';

/**
 * Screen 3: Profile and Edit Profile Screen (only Customer)
 * 
 * Explanation for Viva:
 * - This screen displays the customer's personal profile information.
 * - Requirement: only Customer role is meant to manage customer profiles.
 *   If an Admin navigates here, an advisory banner is shown with a switch button.
 * - Provides an Edit Profile Modal with basic input validation
 *   (valid name, email, 10-digit phone, and address).
 * - Saves updated profile data to global GroceryContext.
 */

export default function ProfileScreen({ navigation }) {
  const { user, updateProfile, logout } = useGrocery();
  // Keeps content above the phone's navigation bar when opened from the drawer
  const bottomSpace = useBottomSpace();

  // Edit Profile Modal State
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  // Form Fields for Editing Profile
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [editAddress, setEditAddress] = useState(user.address);

  // Validation Errors
  const [errors, setErrors] = useState({});

  // Open Edit Modal with current values
  const handleOpenEdit = () => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone);
    setEditAddress(user.address);
    setErrors({});
    setEditModalVisible(true);
  };

  // Validate and Save Changes
  const handleSaveProfile = () => {
    let currentErrors = {};

    if (!isNonEmpty(editName)) {
      currentErrors.name = 'Name cannot be empty';
    }
    if (!isValidEmail(editEmail)) {
      currentErrors.email = 'Please enter a valid email address';
    }
    if (!isValidPhone(editPhone)) {
      currentErrors.phone = 'Phone number must be at least 10 digits';
    }
    if (!isNonEmpty(editAddress)) {
      currentErrors.address = 'Address cannot be empty';
    }

    setErrors(currentErrors);

    if (Object.keys(currentErrors).length === 0) {
      updateProfile({
        name: editName,
        email: editEmail,
        phone: editPhone,
        address: editAddress,
      });
      setEditModalVisible(false);
      Alert.alert('Profile Updated', 'Your customer profile changes have been saved!');
    }
  };

  // Sign out confirmation
  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.replace('Home');
        },
      },
    ]);
  };

  return (
    <ScreenBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: bottomSpace }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => navigation.openDrawer()}
          >
            <Ionicons name="menu-outline" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity style={styles.iconCircle} onPress={handleOpenEdit}>
            <Ionicons name="create-outline" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        {/* Role Notice (Requirement: only Customer) */}
        {user.role === 'Admin' ? (
          <View style={styles.adminWarningCard}>
            <Ionicons name="information-circle" size={22} color="#856404" />
            <View style={{ flex: 1 }}>
              <Text style={styles.adminWarningTitle}>Customer Screen Notice</Text>
              <Text style={styles.adminWarningText}>
                Per project requirements, this Profile screen is designed for Customer accounts.
                You are currently logged in as Admin.
              </Text>
            </View>
          </View>
        ) : null}

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="person" size={12} color={COLORS.secondary} />
            <Text style={styles.roleBadgeText}>Verified Customer</Text>
          </View>
          <Text style={styles.userEmail}>{user.email}</Text>

          <TouchableOpacity style={styles.editBtn} onPress={handleOpenEdit}>
            <Ionicons name="pencil-sharp" size={16} color={COLORS.textDark} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Personal Information</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="person-outline" size={18} color={COLORS.secondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{user.name}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="mail-outline" size={18} color={COLORS.secondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="call-outline" size={18} color={COLORS.secondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Mobile Number</Text>
              <Text style={styles.infoValue}>+91 {user.phone}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoIconBox}>
              <Ionicons name="location-outline" size={18} color={COLORS.secondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Default Delivery Address</Text>
              <Text style={styles.infoValue}>{user.address}</Text>
            </View>
          </View>
        </View>

        {/* Quick Menu Options */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Account Settings</Text>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('MyOrders')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="receipt-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.menuTitle}>My Orders</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('FavoritesTab')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="heart-outline" size={20} color={COLORS.accentRed} />
              <Text style={styles.menuTitle}>My Favorite Products</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('CartTab')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="cart-outline" size={20} color={COLORS.primaryDark} />
              <Text style={styles.menuTitle}>My Shopping Cart</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
          </TouchableOpacity>

        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />

        {/* Edit Profile Modal */}
        <Modal
          visible={isEditModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <KeyboardAwareOverlay>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Customer Profile</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color={COLORS.textDark} />
                </TouchableOpacity>
              </View>

              {/* Name Input */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Full Name</Text>
                <KeyboardInput
                  style={[styles.modalInput, errors.name && styles.modalInputError]}
                  value={editName}
                  onChangeText={(val) => {
                    setEditName(val);
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                />
                {errors.name && <Text style={styles.modalErrorText}>{errors.name}</Text>}
              </View>

              {/* Email Input */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Email Address</Text>
                <KeyboardInput
                  style={[styles.modalInput, errors.email && styles.modalInputError]}
                  value={editEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={(val) => {
                    setEditEmail(val);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                />
                {errors.email && <Text style={styles.modalErrorText}>{errors.email}</Text>}
              </View>

              {/* Phone Input */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Phone Number</Text>
                <KeyboardInput
                  style={[styles.modalInput, errors.phone && styles.modalInputError]}
                  value={editPhone}
                  keyboardType="phone-pad"
                  onChangeText={(val) => {
                    setEditPhone(val);
                    if (errors.phone) setErrors({ ...errors, phone: null });
                  }}
                />
                {errors.phone && <Text style={styles.modalErrorText}>{errors.phone}</Text>}
              </View>

              {/* Address Input */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Delivery Address</Text>
                <KeyboardInput
                  style={[styles.modalInput, errors.address && styles.modalInputError]}
                  value={editAddress}
                  onChangeText={(val) => {
                    setEditAddress(val);
                    if (errors.address) setErrors({ ...errors, address: null });
                  }}
                />
                {errors.address && <Text style={styles.modalErrorText}>{errors.address}</Text>}
              </View>

              {/* Modal Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.cancelModalBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveModalBtn} onPress={handleSaveProfile}>
                  <Text style={styles.saveModalBtnText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareOverlay>
        </Modal>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 14,
  },
  iconCircle: {
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  adminWarningCard: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEEBA',
    borderWidth: 1,
    margin: 16,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  adminWarningTitle: {
    fontWeight: '700',
    color: '#856404',
    fontSize: 13,
  },
  adminWarningText: {
    fontSize: 12,
    color: '#66512C',
    marginVertical: 4,
    lineHeight: 16,
  },
  switchCustomerBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  switchCustomerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  profileCard: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginTop: 4,
  },
  roleBadgeText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    marginTop: 14,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  sectionCard: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F3E9',
    gap: 12,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F3E9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEB',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FFD4D4',
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.error,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    padding: 22,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalField: {
    gap: 4,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textDark,
  },
  modalInputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FFF5F5',
  },
  modalErrorText: {
    fontSize: 11,
    color: COLORS.error,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EAE6D6',
    alignItems: 'center',
  },
  cancelModalBtnText: {
    fontWeight: '700',
    color: COLORS.textMedium,
  },
  saveModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveModalBtnText: {
    fontWeight: '700',
    color: COLORS.textDark,
  },
});
