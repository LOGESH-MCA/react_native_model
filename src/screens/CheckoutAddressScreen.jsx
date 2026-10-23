import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOW } from '../theme/colors';
import { useGrocery } from '../context/GroceryContext';
import { ScreenBackground, ScreenHeader, IconButton } from '../components/UI';
import { KeyboardAwareScrollView, KeyboardInput } from '../components/KeyboardAware';
import { FadeInUp } from '../components/Animations';
import { getAddresses, saveAddress, deleteAddress, formatAddress } from '../services/orderStorage';
import { isNonEmpty, isValidPhone } from '../utils/validation';

/**
 * Checkout Step 1: Delivery Address
 *
 * Explanation for Viva:
 * - "Book Now" in the cart opens this screen instead of placing the order directly.
 * - Saved addresses are read from addresses.json on the phone (no backend).
 * - The customer can pick a saved address or add a new one (validated, then saved).
 * - "Proceed to Pay" passes the chosen address to the Razorpay Payment screen.
 */

const LABELS = ['Home', 'Work', 'Other'];

export default function CheckoutAddressScreen({ navigation }) {
  const { user, cart, cartCount, grandTotal } = useGrocery();
  const insets = useSafeAreaInsets();

  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // New address form
  const [form, setForm] = useState({
    fullName: user.name || '',
    phone: user.phone || '',
    line1: '',
    line2: '',
    city: '',
    pincode: '',
    label: 'Home',
  });
  const [errors, setErrors] = useState({});

  // Load saved addresses from addresses.json
  useEffect(() => {
    getAddresses(user.id).then((list) => {
      setAddresses(list);
      setSelectedId(list[0]?.id || null);
      setShowForm(list.length === 0);
      setLoading(false);
    });
  }, [user.id]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!isNonEmpty(form.fullName)) e.fullName = 'Enter the receiver name';
    if (!isValidPhone(form.phone)) e.phone = 'Enter a valid 10-digit phone number';
    if (!isNonEmpty(form.line1)) e.line1 = 'Enter house / flat and street';
    if (!isNonEmpty(form.city)) e.city = 'Enter your city';
    if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = 'Pincode must be 6 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validate()) return;
    setSaving(true);
    const trimmed = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
    const saved = await saveAddress(user.id, trimmed);
    setAddresses((prev) => [saved, ...prev]);
    setSelectedId(saved.id);
    setShowForm(false);
    setSaving(false);
    setForm((prev) => ({ ...prev, line1: '', line2: '', city: '', pincode: '' }));
  };

  const handleDelete = (address) => {
    Alert.alert('Delete Address', `Remove the ${address.label} address?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const list = await deleteAddress(user.id, address.id);
          setAddresses(list);
          if (selectedId === address.id) setSelectedId(list[0]?.id || null);
          if (list.length === 0) setShowForm(true);
        },
      },
    ]);
  };

  const handleProceed = () => {
    const address = addresses.find((a) => a.id === selectedId);
    if (!address) {
      Alert.alert('Select Address', 'Please add or select a delivery address.');
      return;
    }
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty.');
      return;
    }
    navigation.navigate('Payment', { address });
  };

  const renderField = (key, label, props = {}) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <KeyboardInput
        style={[styles.input, errors[key] && styles.inputError]}
        value={form[key]}
        onChangeText={(v) => updateField(key, v)}
        placeholderTextColor={COLORS.textLight}
        {...props}
      />
      {errors[key] ? <Text style={styles.errorText}>{errors[key]}</Text> : null}
    </View>
  );

  return (
    <ScreenBackground>
      <ScreenHeader
        title="Delivery Address"
        left={<IconButton icon="arrow-back" onPress={() => navigation.goBack()} />}
      />

      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        {/* Checkout steps */}
        <View style={styles.stepsRow}>
          <Text style={[styles.step, styles.stepActive]}>1 Address</Text>
          <View style={styles.stepLine} />
          <Text style={styles.step}>2 Payment</Text>
          <View style={styles.stepLine} />
          <Text style={styles.step}>3 Done</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primaryDark} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Saved addresses */}
            {addresses.map((address, index) => {
              const selected = address.id === selectedId;
              return (
                <FadeInUp key={address.id} index={index}>
                  <TouchableOpacity
                    style={[styles.addressCard, selected && styles.addressCardSelected]}
                    onPress={() => setSelectedId(address.id)}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name={selected ? 'radio-button-on' : 'radio-button-off'}
                      size={22}
                      color={selected ? COLORS.secondary : COLORS.textLight}
                    />
                    <View style={{ flex: 1 }}>
                      <View style={styles.addressTop}>
                        <Text style={styles.addressName}>{address.fullName}</Text>
                        <View style={styles.labelChip}>
                          <Text style={styles.labelChipText}>{address.label}</Text>
                        </View>
                      </View>
                      <Text style={styles.addressText}>{formatAddress(address)}</Text>
                      <Text style={styles.addressPhone}>+91 {address.phone}</Text>
                    </View>
                    <TouchableOpacity hitSlop={10} onPress={() => handleDelete(address)}>
                      <Ionicons name="trash-outline" size={20} color={COLORS.accentRed} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </FadeInUp>
              );
            })}

            {/* Add new address */}
            {!showForm ? (
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
                <Ionicons name="add-circle-outline" size={22} color={COLORS.textDark} />
                <Text style={styles.addBtnText}>Add New Address</Text>
              </TouchableOpacity>
            ) : (
              <FadeInUp>
                <View style={styles.formCard}>
                  <Text style={styles.formTitle}>New Delivery Address</Text>
                  {renderField('fullName', 'Receiver Name', { placeholder: 'Full name' })}
                  {renderField('phone', 'Phone Number', {
                    placeholder: '10-digit mobile number',
                    keyboardType: 'phone-pad',
                    maxLength: 10,
                  })}
                  {renderField('line1', 'House / Flat, Street', { placeholder: 'e.g. 12, Gandhi Street' })}
                  {renderField('line2', 'Area / Landmark (optional)', { placeholder: 'e.g. Near Bus Stand' })}
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>{renderField('city', 'City', { placeholder: 'City' })}</View>
                    <View style={{ flex: 1 }}>
                      {renderField('pincode', 'Pincode', {
                        placeholder: '600001',
                        keyboardType: 'number-pad',
                        maxLength: 6,
                      })}
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>Save as</Text>
                  <View style={styles.labelRow}>
                    {LABELS.map((label) => (
                      <TouchableOpacity
                        key={label}
                        style={[styles.labelOption, form.label === label && styles.labelOptionActive]}
                        onPress={() => updateField('label', label)}
                      >
                        <Text style={styles.labelOptionText}>{label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.row}>
                    {addresses.length > 0 && (
                      <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAddress} disabled={saving}>
                      {saving ? (
                        <ActivityIndicator color={COLORS.textDark} />
                      ) : (
                        <Text style={styles.saveBtnText}>Save Address</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </FadeInUp>
            )}
          </>
        )}
      </KeyboardAwareScrollView>

      {/* Bottom pay bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 14 }]}>
        <View>
          <Text style={styles.totalLabel}>{cartCount} items · Total</Text>
          <Text style={styles.totalValue}>Rs {grandTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.payBtn, !selectedId && { opacity: 0.5 }]}
          onPress={handleProceed}
          activeOpacity={0.85}
        >
          <Text style={styles.payBtnText}>Proceed to Pay</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    gap: 14,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  step: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  stepActive: {
    color: COLORS.secondary,
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: COLORS.borderDark,
    marginHorizontal: 8,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOW,
  },
  addressCardSelected: {
    borderColor: COLORS.secondary,
  },
  addressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  labelChip: {
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  labelChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.textMedium,
    marginTop: 4,
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.borderDark,
    borderRadius: 18,
    paddingVertical: 16,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  formCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 22,
    padding: 18,
    gap: 12,
    ...SHADOW,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: COLORS.textDark,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    fontSize: 11,
    color: COLORS.error,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  labelRow: {
    flexDirection: 'row',
    gap: 10,
  },
  labelOption: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  labelOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  labelOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8E5D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMedium,
  },
  saveBtn: {
    flex: 2,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  bottomBar: {
    backgroundColor: COLORS.tabBar,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: 22,
    height: 50,
    borderRadius: 25,
    ...SHADOW,
  },
  payBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
});
