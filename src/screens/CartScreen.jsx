import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '../theme/colors';
import { ScreenBackground, ScreenHeader, IconButton, useBottomSpace } from '../components/UI';
import { FadeInUp, scrollItemStyle } from '../components/Animations';
import { useFocusScroll } from '../components/KeyboardAware';

// Height of one cart card + gap, used by the scroll animation
const CART_ITEM_SIZE = 132;
import { useGrocery } from '../context/GroceryContext';

/**
 * Screen 6: My Cart Screen (Admin and Customer)
 * 
 * Explanation for Viva:
 * - This screen displays the customer's grocery cart.
 * - Requirement Part III (iii): Add or Subtract items in cart screen.
 *   Live quantity steppers (+ / -) recalculate item totals, delivery fees,
 *   discounts, and grand total in real-time.
 * - Basic Validation: User cannot proceed to checkout if the cart is empty.
 * - Includes Promo Code validation ('GROCERY20' gives 20% discount).
 * - "Book Now" opens the checkout flow: Delivery Address -> Razorpay Payment -> Order Placed.
 */

export default function CartScreen({ navigation }) {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    deliveryFee,
    discountAmount,
    discountPercent,
    grandTotal,
    applyPromo,
    user,
  } = useGrocery();
  // Keeps content above the phone's navigation bar when opened from the drawer
  const bottomSpace = useBottomSpace();
  // Keeps the promo code box visible above the keyboard while typing
  const { scrollRef, containerRef, onScroll: onFocusScroll, onFocus, onBlur: onPromoBlur, extraSpace } =
    useFocusScroll();
  const promoInputRef = useRef(null);
  const onPromoFocus = () => onFocus(promoInputRef);

  // Local state for promo code input
  const [promoInput, setPromoInput] = useState('');
  // Scroll position drives the shrink/fade animation of cart cards
  const scrollY = useRef(new Animated.Value(0)).current;

  // Handle promo code apply
  const handleApplyPromo = () => {
    if (!promoInput.trim()) {
      Alert.alert('Validation Error', 'Please enter a promo code (e.g. GROCERY20)');
      return;
    }
    const result = applyPromo(promoInput);
    Alert.alert(result.success ? 'Success!' : 'Invalid Code', result.message);
  };

  // Handle Checkout with basic validation
  const handleCheckout = () => {
    // 1. Validation: Ensure cart is not empty
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty! Please add products before checking out.');
      return;
    }

    // 2. Checkout flow: Delivery Address -> Razorpay Payment -> Order Placed
    navigation.navigate('Checkout');
  };

  // Decrease quantity, asking before removing the last one
  const handleDecrease = (item) => {
    if (item.quantity === 1) {
      Alert.alert('Remove Item', `Do you want to remove ${item.product.name} from your cart?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(item.product.id) },
      ]);
    } else {
      decreaseQuantity(item.product.id);
    }
  };

  // Render single cart item card (Matching Figma Frame 11 & Screen 7)
  const renderCartItem = ({ item, index }) => (
    <Animated.View style={scrollItemStyle(scrollY, index, CART_ITEM_SIZE)}>
    <FadeInUp index={index}>
    <View style={styles.cartCard}>
      {/* Product Image */}
      <View style={styles.imageBox}>
        <Image source={item.product.image} style={styles.cartItemImage} resizeMode="contain" />
      </View>

      {/* Product Info */}
      <View style={styles.infoCol}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text style={styles.categoryText}>{item.product.category}</Text>
        <Text style={styles.pricePerUnit}>
          <Text style={{ fontWeight: '800' }}>Rs {item.product.price}</Text>/{item.product.unit}
        </Text>
      </View>

      {/* Vertical Stepper (+ / -) matching Figma (Part III - iii) */}
      <View style={styles.stepperBox}>
        <TouchableOpacity hitSlop={6} onPress={() => increaseQuantity(item.product.id)}>
          <Ionicons name="add" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.stepperCountText}>{item.quantity}</Text>
        <TouchableOpacity hitSlop={6} onPress={() => handleDecrease(item)}>
          <Ionicons name="remove" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>
    </View>
    </FadeInUp>
    </Animated.View>
  );

  return (
    <ScreenBackground>
      <ScreenHeader
        title="My Cart"
        left={<IconButton icon="arrow-back" onPress={() => navigation.goBack()} />}
        right={
          <IconButton
            icon="trash-outline"
            size={22}
            onPress={() => {
              if (cart.length > 0) {
                Alert.alert('Clear Cart', 'Remove all items from your cart?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', style: 'destructive', onPress: clearCart },
                ]);
              }
            }}
          />
        }
      />

      <View ref={containerRef} style={{ flex: 1 }} collapsable={false}>
      <Animated.FlatList
        ref={scrollRef}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
          listener: onFocusScroll,
        })}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        data={cart}
        keyExtractor={(item) => item.product.id}
        renderItem={renderCartItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 30 + bottomSpace + extraSpace },
        ]}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          cart.length > 0 ? (
            <View style={styles.footerSection}>
              {/* Promo Code Input Card */}
              <View style={styles.promoCard}>
                <Ionicons name="pricetag-outline" size={20} color={COLORS.secondary} />
                <TextInput
                  style={styles.promoInput}
                  placeholder="Promo Code (use GROCERY20)"
                  placeholderTextColor={COLORS.textLight}
                  value={promoInput}
                  onChangeText={setPromoInput}
                  ref={promoInputRef}
                  onFocus={onPromoFocus}
                  onBlur={onPromoBlur}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.applyBtn} onPress={handleApplyPromo}>
                  <Text style={styles.applyBtnText}>Apply</Text>
                </TouchableOpacity>
              </View>

              {/* Bill Details Breakdown */}
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Subtotal</Text>
                <Text style={styles.billValue}>Rs {cartSubtotal.toFixed(2)}</Text>
              </View>

              {discountPercent > 0 && (
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, { color: COLORS.secondary }]}>
                    Promo Discount ({discountPercent}%)
                  </Text>
                  <Text style={[styles.billValue, { color: COLORS.secondary }]}>
                    - Rs {discountAmount.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Charge</Text>
                <Text style={styles.billValue}>
                  {deliveryFee === 0 ? 'FREE' : `Rs ${deliveryFee.toFixed(2)}`}
                </Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.grandTotalLabel}>Total Amount</Text>
                <Text style={styles.grandTotalValue}>Rs {grandTotal.toFixed(2)}</Text>
              </View>

              {/* Book Now button (olive pill with chevrons, like Figma) */}
              <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} activeOpacity={0.85}>
                <Text style={styles.checkoutBtnText}>Book Now</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMedium} />
                <Ionicons name="chevron-forward" size={20} color={COLORS.textDark} style={{ marginLeft: -14 }} />
              </TouchableOpacity>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cart-outline" size={48} color={COLORS.textLight} />
            </View>
            <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptyDesc}>
              Looks like you haven't added any fresh groceries to your cart yet.
            </Text>
            <TouchableOpacity style={styles.shopNowBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.shopNowBtnText}>Browse Fresh Products</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
        }
      />
      </View>

    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    gap: 16,
  },
  cartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 6,
    padding: 12,
    gap: 16,
    ...SHADOW,
  },
  imageBox: {
    width: 104,
    height: 92,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  cartItemImage: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
  },
  productName: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.textDark,
    marginTop: 2,
  },
  pricePerUnit: {
    fontSize: 18,
    color: COLORS.textDark,
    marginTop: 4,
  },
  stepperBox: {
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingVertical: 4,
    width: 40,
    height: 88,
  },
  stepperCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  footerSection: {
    marginTop: 12,
    gap: 12,
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingLeft: 14,
    padding: 6,
    gap: 8,
    ...SHADOW,
  },
  promoInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    paddingVertical: 8,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  billLabel: {
    fontSize: 14,
    color: COLORS.textMedium,
    fontWeight: '600',
  },
  billValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryDark,
    height: 54,
    borderRadius: 27,
    marginTop: 14,
    gap: 10,
    ...SHADOW,
  },
  checkoutBtnText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    ...SHADOW,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  shopNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 26,
    gap: 8,
  },
  shopNowBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  orderSuccessCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    gap: 12,
  },
  successIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderSuccessTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  orderIdText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  orderSummaryBox: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
    width: '100%',
    gap: 6,
  },
  orderSummaryLine: {
    fontSize: 12,
    color: COLORS.textDark,
  },
  doneBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 6,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
});
