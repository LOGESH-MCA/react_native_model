import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOW } from '../theme/colors';
import { ScreenBackground } from '../components/UI';
import { formatAddress } from '../services/orderStorage';

/**
 * Checkout Step 3: Order Placed
 *
 * Explanation for Viva:
 * - Shown only after Razorpay confirms the payment.
 * - Displays the order ID, Razorpay payment ID, delivery address and bill.
 * - "Continue Shopping" resets the navigation stack so Back cannot return to payment.
 */

export default function OrderSuccessScreen({ route, navigation }) {
  const { order } = route.params;
  const insets = useSafeAreaInsets();
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }).start();
  }, [pop]);

  const goHome = () => {
    navigation.reset({ index: 0, routes: [{ name: 'AppDrawer' }] });
    return true;
  };

  // Android back button also goes home (not back to the payment page)
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', goHome);
    return () => sub.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const date = new Date(order.createdAt);

  return (
    <ScreenBackground>
      {/* Scrollable details: fixed-height ScrollView so long orders scroll on every device */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 30 }]}
        showsVerticalScrollIndicator
      >
        <Animated.View style={[styles.checkCircle, { transform: [{ scale: pop }] }]}>
          <Ionicons name="checkmark" size={56} color={COLORS.white} />
        </Animated.View>

        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>Payment successful. Your groceries arrive in 25–30 mins.</Text>

        <View style={styles.card}>
          <Row label="Order ID" value={order.id} bold />
          <Row label="Payment ID" value={order.payment.paymentId} />
          <Row label="Paid via" value={`Razorpay${order.payment.method ? ' · ' + order.payment.method.toUpperCase() : ''}`} />
          <Row label="Date" value={`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivering to</Text>
          <Text style={styles.addressName}>
            {order.address.fullName} · {order.address.label}
          </Text>
          <Text style={styles.addressText}>{formatAddress(order.address)}</Text>
          <Text style={styles.addressText}>+91 {order.address.phone}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          {order.items.map((item) => (
            <Row
              key={item.id}
              label={`${item.name} × ${item.quantity}`}
              value={`Rs ${(item.price * item.quantity).toFixed(2)}`}
            />
          ))}
          <View style={styles.divider} />
          {order.discount > 0 && <Row label="Discount" value={`- Rs ${order.discount.toFixed(2)}`} />}
          <Row label="Delivery" value={order.deliveryFee === 0 ? 'FREE' : `Rs ${order.deliveryFee.toFixed(2)}`} />
          <Row label="Total Paid" value={`Rs ${order.total.toFixed(2)}`} bold />
        </View>

      </ScrollView>

      {/* Button stays visible at the bottom while the details scroll */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 14 }]}>
        <TouchableOpacity style={styles.homeBtn} onPress={goHome} activeOpacity={0.85}>
          <Text style={styles.homeBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

function Row({ label, value, bold }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.bold]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 14,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMedium,
    textAlign: 'center',
    marginBottom: 6,
  },
  card: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 16,
    gap: 8,
    ...SHADOW,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLabel: {
    fontSize: 14,
    color: COLORS.textMedium,
    flexShrink: 0,
    maxWidth: '50%',
  },
  rowValue: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  bold: {
    fontWeight: '800',
    color: COLORS.textDark,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.textMedium,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: COLORS.tabBar,
  },
  homeBtn: {
    alignSelf: 'stretch',
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  homeBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
  },
});
