import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOW } from '../theme/colors';
import { useGrocery } from '../context/GroceryContext';
import { ScreenBackground, ScreenHeader, IconButton } from '../components/UI';

/**
 * Screen 5: Product Details Screen (Customer / Student role)
 *
 * Explanation for Viva:
 * - This screen displays the product image, rating, description and related items.
 * - Matches Figma Screen 5 / 6 (Details design).
 * - State management:
 *   1. `quantity`: kg stepper (- 1kg +) before adding to cart.
 *   2. `expanded`: toggles the "See more" description.
 *   3. `toggleFavorite`: toggle item in/out of favorites directly from header.
 * - Fulfills Requirement Part III (ii): Add product to cart with selected quantity.
 */

export default function ProductDetailsScreen({ route, navigation }) {
  // Extract product passed from navigation route params
  const { product } = route.params;
  const { products, user, addToCart, toggleFavorite, isFavorite } = useGrocery();
  // Admin only views products: no cart, quantity or favourites on this screen
  const isAdmin = user.role === 'Admin';
  const insets = useSafeAreaInsets();

  // Local state for quantity counter (in kg)
  const [quantity, setQuantity] = useState(1);
  const [expanded, setExpanded] = useState(false);

  const totalPrice = product.price * quantity;
  const favorited = isFavorite(product.id);

  // Related items: other products from the same category
  const relatedItems = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Add to cart with selected quantity
  const handleAddToCart = () => {
    addToCart(product, quantity, '1kg');
    Alert.alert(
      'Added to Cart! 🛒',
      `${quantity}kg ${product.name} added to your shopping cart. Total: Rs ${totalPrice}`,
      [
        { text: 'Keep Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('AppDrawer', { screen: 'MainTabs', params: { screen: 'CartTab' } }) },
      ]
    );
  };

  return (
    <ScreenBackground>
      <ScreenHeader
        title="Details"
        left={<IconButton icon="arrow-back" onPress={() => navigation.goBack()} />}
        right={
          isAdmin ? null : (
            <IconButton
              icon={favorited ? 'heart' : 'heart-outline'}
              color={COLORS.accentRed}
              onPress={() => toggleFavorite(product.id)}
            />
          )
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Large Product Hero Image */}
        <Image source={product.image} style={styles.heroImage} resizeMode="contain" />

        {/* Carousel dots */}
        <View style={styles.dotsRow}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>

        {/* Name, rating & kg stepper */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.productTitle}>Fresh {product.name}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons
                  key={i}
                  name={product.rating >= i ? 'star' : product.rating >= i - 0.5 ? 'star-half' : 'star-outline'}
                  size={18}
                  color={COLORS.star}
                />
              ))}
              <Text style={styles.ratingText}>
                {product.rating} ({product.reviews})
              </Text>
            </View>
          </View>

          {!isAdmin && (
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={16} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{quantity}kg</Text>
            <TouchableOpacity style={styles.stepperBtn} onPress={() => setQuantity(quantity + 1)}>
              <Ionicons name="add" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          )}
        </View>

        {/* Description */}
        <Text style={styles.sectionHeading}>Description</Text>
        <Text style={styles.descriptionText} numberOfLines={expanded ? undefined : 3}>
          {product.description} Calories: {product.calories}.
        </Text>
        <Text style={styles.seeMore} onPress={() => setExpanded(!expanded)}>
          {expanded ? 'See less' : 'See more'}
        </Text>

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Related Items</Text>
            <View style={styles.relatedRow}>
              {relatedItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.relatedCard}
                  onPress={() => navigation.push('ProductDetails', { product: item })}
                >
                  <Image source={item.image} style={styles.relatedImage} resizeMode="contain" />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Sticky Action Bar (yellow, like Figma) */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 14 }]}>
        <View>
          <Text style={styles.totalLabel}>Price</Text>
          <Text style={styles.totalValue}>
            Rs {isAdmin ? `${product.price}/${product.unit}` : totalPrice}
          </Text>
        </View>

        {isAdmin ? (
          /* Admin: show stock instead of Add to Cart */
          <View style={styles.stockBox}>
            <Text style={styles.totalLabel}>In Stock</Text>
            <Text style={styles.totalValue}>
              {product.stock} {product.unit}
            </Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart} activeOpacity={0.8}>
            <Text style={styles.addToCartBtnText}>Add to Cart</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.primaryDark} />
            <Ionicons name="chevron-forward" size={18} color={COLORS.primaryDark} style={{ marginLeft: -12 }} />
          </TouchableOpacity>
        )}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 28,
    paddingBottom: 30,
  },
  heroImage: {
    width: '100%',
    height: 230,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#B9D9A0',
  },
  dotActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginLeft: 6,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8C33A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    minWidth: 32,
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 26,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 20,
  },
  seeMore: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 2,
  },
  relatedRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  relatedCard: {
    flex: 1,
    aspectRatio: 0.8,
    maxWidth: 80,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  relatedImage: {
    width: '100%',
    height: '100%',
  },
  bottomBar: {
    backgroundColor: COLORS.tabBar,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 14,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  stockBox: {
    alignItems: 'flex-end',
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 30,
    height: 50,
    borderRadius: 25,
    gap: 8,
    ...SHADOW,
  },
  addToCartBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
});
