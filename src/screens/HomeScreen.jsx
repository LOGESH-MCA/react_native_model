import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOW } from '../theme/colors';
import { ScreenBackground } from '../components/UI';
import { KeyboardAwareScrollView, KeyboardInput } from '../components/KeyboardAware';
import OnboardingCarousel from '../components/OnboardingCarousel';
import { useGrocery } from '../context/GroceryContext';
import { isValidEmail, isValidPassword, isNonEmpty, isValidPhone } from '../utils/validation';

/**
 * Screen 1: Home Screen with Sign Up & Sign In (Admin & Customer)
 * 
 * Explanation for Viva:
 * - This screen handles user onboarding and authentication.
 * - Supports two roles: 'Customer' and 'Admin'.
 * - Uses React state (`useState`) to switch between 'Sign In' and 'Sign Up' modes.
 * - Performs basic input validation on email, password, and phone number.
 */

export default function HomeScreen({ navigation }) {
  const { login, signup } = useGrocery();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  // Smaller welcome image on short phones so the form and button fit
  const heroHeight = Math.round(Math.min(170, screenHeight * 0.16));
  const [showAuth, setShowAuth] = useState(false);

  // Mode: 'signin' or 'signup'
  const [authMode, setAuthMode] = useState('signin');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validation Error States
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validate form inputs
  const validateForm = () => {
    let currentErrors = {};

    if (authMode === 'signup' && !isNonEmpty(name)) {
      currentErrors.name = 'Full name is required';
    }

    if (!isValidEmail(email)) {
      currentErrors.email = 'Please enter a valid email address';
    }

    if (!isValidPassword(password)) {
      currentErrors.password = 'Password must be at least 6 characters';
    }

    if (authMode === 'signup') {
      if (!isValidPhone(phone)) {
        currentErrors.phone = 'Please enter a valid 10-digit phone number';
      }
      if (password !== confirmPassword) {
        currentErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };

  // Handle Submit (Sign In or Sign Up) - verified against users.json
  const handleSubmit = async () => {
    setFormError('');
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const result =
      authMode === 'signin'
        ? await login(email, password) // role comes from the account itself
        : await signup(name, email, phone, password); // Sign Up is Customer only
    setLoading(false);

    if (!result.success) {
      setFormError(result.message);
      return;
    }

    if (authMode === 'signup') {
      Alert.alert('Account Created!', `Welcome to Daily Grocery, ${result.user.name}!`);
    }
    // Navigate to the main app (Drawer navigation)
    navigation.replace('AppDrawer');
  };

  // Switch between Sign In and Sign Up tabs
  const changeMode = (mode) => {
    setAuthMode(mode);
    setErrors({});
    setFormError('');
  };

  // Onboarding carousel (Figma Screen 1) shown first, then the Sign In / Sign Up form
  if (!showAuth) {
    return <OnboardingCarousel onDone={() => setShowAuth(true)} />;
  }

  return (
    <ScreenBackground>
      {/* Scrolls the focused field above the keyboard */}
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* Top Hero Section matching Figma Screen 1 */}
        <View style={styles.heroSection}>
          <Image
            source={require('../../assets/images/hero_fruits.png')}
            style={[styles.heroImage, { height: heroHeight, width: heroHeight * 1.2 }]}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>Welcome to Grocery Shop</Text>
          <Text style={styles.heroSubtitle}>
            Fresh fruits & vegetables delivered to your doorstep
          </Text>
        </View>

        {/* Card Form Container */}
        <View style={styles.cardContainer}>
          {/* Toggle between Sign In and Sign Up */}
          <View style={styles.authToggle}>
            <TouchableOpacity
              style={[styles.authTab, authMode === 'signin' && styles.authTabActive]}
              onPress={() => changeMode('signin')}
            >
              <Text style={[styles.authTabText, authMode === 'signin' && styles.authTabTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.authTab, authMode === 'signup' && styles.authTabActive]}
              onPress={() => changeMode('signup')}
            >
              <Text style={[styles.authTabText, authMode === 'signup' && styles.authTabTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* No role picker: the admin account is detected from its credentials */}
          {authMode === 'signup' && (
            <Text style={styles.signupNote}>Create a new Customer account</Text>
          )}

          {/* Form Inputs */}
          <View style={styles.formContent}>
            {authMode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={[styles.inputBox, errors.name && styles.inputError]}>
                  <Ionicons name="person-outline" size={20} color={COLORS.textMedium} />
                  <KeyboardInput
                    style={styles.textInput}
                    placeholder="Enter your name"
                    placeholderTextColor={COLORS.textLight}
                    value={name}
                    onChangeText={(val) => {
                      setName(val);
                      if (errors.name) setErrors({ ...errors, name: null });
                    }}
                  />
                </View>
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>
            )}

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputBox, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textMedium} />
                <KeyboardInput
                  style={styles.textInput}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {authMode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={[styles.inputBox, errors.phone && styles.inputError]}>
                  <Ionicons name="call-outline" size={20} color={COLORS.textMedium} />
                  <KeyboardInput
                    style={styles.textInput}
                    placeholder="10-digit mobile number"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={(val) => {
                      setPhone(val);
                      if (errors.phone) setErrors({ ...errors, phone: null });
                    }}
                  />
                </View>
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>
            )}

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputBox, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMedium} />
                <KeyboardInput
                  style={styles.textInput}
                  placeholder="Enter password (min 6 chars)"
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errors.password) setErrors({ ...errors, password: null });
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textMedium}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {authMode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={[styles.inputBox, errors.confirmPassword && styles.inputError]}>
                  <Ionicons name="shield-outline" size={20} color={COLORS.textMedium} />
                  <KeyboardInput
                    style={styles.textInput}
                    placeholder="Re-enter password"
                    placeholderTextColor={COLORS.textLight}
                    secureTextEntry={!showPassword}
                    value={confirmPassword}
                    onChangeText={(val) => {
                      setConfirmPassword(val);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                    }}
                  />
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>
            )}

            {formError ? (
              <View style={styles.formErrorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.formErrorText}>{formError}</Text>
              </View>
            ) : null}

            {/* Primary Action Button */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.textDark} />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>
                    {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.textDark} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 18,
  },
  heroImage: {
    width: 200,
    height: 170,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  cardContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 28,
    marginHorizontal: 18,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
    ...SHADOW,
  },
  authToggle: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#EEEBDD',
    marginBottom: 20,
  },
  authTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  authTabActive: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  authTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  authTabTextActive: {
    color: COLORS.textDark,
    fontWeight: '800',
  },
  formContent: {
    gap: 14,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FFF5F5',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    padding: 0,
  },
  errorText: {
    fontSize: 11,
    color: COLORS.error,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  signupNote: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  formErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    padding: 10,
  },
  formErrorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.error,
  },
});
