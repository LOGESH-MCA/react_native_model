import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '../theme/colors';
import { useGrocery } from '../context/GroceryContext';
import { ScreenBackground, ScreenHeader, IconButton, useBottomSpace } from '../components/UI';
import { FadeInUp } from '../components/Animations';
import {
  getOrders,
  getAllOrders,
  updateOrderStatus,
  formatAddress,
  ORDER_STATUSES,
} from '../services/orderStorage';

/**
 * Orders Screen (Customer: "My Orders" / Admin: "Orders")
 *
 * Explanation for Viva:
 * - Orders are saved in orders.json after a successful Razorpay payment.
 * - Customer sees only their own orders (opened from Profile -> My Orders).
 * - Admin sees every customer's orders (Orders tab) and can move an order through
 *   Placed -> Packed -> Out for Delivery -> Delivered; the customer sees the new status.
 * - `useFocusEffect` reloads the list every time the screen is opened.
 * - No backend: the admin sees orders placed on the same phone.
 */

const STATUS_COLORS = {
  Placed: { bg: '#FFF3CD', text: '#856404' },
  Packed: { bg: '#E0ECFF', text: '#1D4ED8' },
  'Out for Delivery': { bg: '#FFE8D6', text: '#C2410C' },
  Delivered: { bg: COLORS.secondaryLight, text: COLORS.secondary },
};

export default function OrdersScreen({ navigation }) {
  const { user, products } = useGrocery();
  const isAdmin = user.role === 'Admin';
  const bottomSpace = useBottomSpace();

  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    const list = isAdmin ? await getAllOrders() : await getOrders(user.id);
    setOrders(list);
  }, [isAdmin, user.id]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  // Admin: advance order to next status
  const advanceStatus = async (order) => {
    const current = ORDER_STATUSES.indexOf(order.status || 'Placed');
    const next = ORDER_STATUSES[current + 1];
    if (!next) return;
    await updateOrderStatus(order.userId, order.id, next);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
  };

  const imageFor = (productId) => products.find((p) => p.id === productId)?.image;

  const renderOrder = ({ item: order, index }) => {
    const status = order.status || 'Placed';
    const colors = STATUS_COLORS[status] || STATUS_COLORS.Placed;
    const expanded = expandedId === order.id;
    const nextStatus = ORDER_STATUSES[ORDER_STATUSES.indexOf(status) + 1];
    const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
    const date = new Date(order.createdAt);

    return (
      <FadeInUp index={index}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => setExpandedId(expanded ? null : order.id)}
        >
          {/* Header row */}
          <View style={styles.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.orderId}>{order.id}</Text>
              <Text style={styles.orderDate}>
                {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
              <Text style={[styles.statusText, { color: colors.text }]}>{status}</Text>
            </View>
          </View>

          {isAdmin && order.customer && (
            <View style={styles.customerRow}>
              <Ionicons name="person-circle-outline" size={18} color={COLORS.textMedium} />
              <Text style={styles.customerText}>
                {order.customer.name} · {order.customer.email}
              </Text>
            </View>
          )}

          {/* Product thumbnails */}
          <View style={styles.thumbRow}>
            {order.items.slice(0, 4).map((item) => (
              <View key={item.id} style={styles.thumb}>
                {imageFor(item.id) && (
                  <Image source={imageFor(item.id)} style={styles.thumbImage} resizeMode="contain" />
                )}
              </View>
            ))}
            {order.items.length > 4 && <Text style={styles.moreText}>+{order.items.length - 4}</Text>}
          </View>

          <View style={styles.cardBottom}>
            <Text style={styles.itemCount}>{itemCount} items</Text>
            <Text style={styles.total}>Rs {order.total.toFixed(2)}</Text>
          </View>

          {/* Expanded details */}
          {expanded && (
            <View style={styles.details}>
              {order.items.map((item) => (
                <View key={item.id} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    {item.name} × {item.quantity}
                  </Text>
                  <Text style={styles.detailValue}>Rs {(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
              <View style={styles.divider} />
              <Text style={styles.detailHeading}>Delivery Address</Text>
              <Text style={styles.detailText}>
                {order.address.fullName} · +91 {order.address.phone}
              </Text>
              <Text style={styles.detailText}>{formatAddress(order.address)}</Text>
              <Text style={styles.detailHeading}>Payment</Text>
              <Text style={styles.detailText}>
                Razorpay {order.payment.method ? `(${order.payment.method})` : ''} · {order.payment.paymentId}
              </Text>
            </View>
          )}

          <View style={styles.actionsRow}>
            <Text style={styles.toggleText}>{expanded ? 'Hide details' : 'View details'}</Text>
            {isAdmin && nextStatus && (
              <TouchableOpacity style={styles.statusBtn} onPress={() => advanceStatus(order)}>
                <Text style={styles.statusBtnText}>Mark {nextStatus}</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </FadeInUp>
    );
  };

  // Customer opens this from Profile (back button); Admin opens it as a tab (menu button)
  const canGoBack = !isAdmin && navigation.canGoBack();

  return (
    <ScreenBackground>
      <ScreenHeader
        title={isAdmin ? 'Orders' : 'My Orders'}
        left={
          canGoBack ? (
            <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
          ) : (
            <IconButton icon="menu" onPress={() => navigation.openDrawer?.()} />
          )
        }
        right={<IconButton icon="refresh" size={22} onPress={onRefresh} />}
      />

      <FlatList
        data={orders}
        keyExtractor={(order) => order.id}
        renderItem={renderOrder}
        contentContainerStyle={[styles.list, { paddingBottom: 30 + bottomSpace }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyCircle}>
              <Ionicons name="receipt-outline" size={44} color={COLORS.textLight} />
            </View>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>
              {isAdmin
                ? 'Orders placed by customers will appear here.'
                : 'Your paid orders will appear here.'}
            </Text>
          </View>
        }
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 16,
    gap: 10,
    ...SHADOW,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMedium,
    flex: 1,
  },
  thumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    padding: 4,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  moreText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMedium,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    fontSize: 14,
    color: COLORS.textMedium,
    fontWeight: '600',
  },
  total: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  details: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textMedium,
    flexShrink: 1,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  detailHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 4,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  statusBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...SHADOW,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMedium,
    textAlign: 'center',
  },
});
