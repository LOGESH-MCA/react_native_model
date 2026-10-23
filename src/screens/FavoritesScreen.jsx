import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '../theme/colors';
import { ScreenBackground, ScreenHeader, IconButton, useBottomSpace } from '../components/UI';
import { FadeInUp, scrollItemStyle } from '../components/Animations';

// Height of one row of favourite cards (card + margin), used by the scroll animation
const FAV_ROW_SIZE = 220;
const FAV_HEADER_SIZE = 56;
import { useGrocery } from '../context/GroceryContext';

/**
 * Screen 4: Add Favorite Screen (only Customer)
 * 
 * Explanation for Viva:
 * - Displays items bookmarked as favorites by the customer.
 * - Requirement Part III (ii): Allows adding a single favorite item to cart,
 *   OR adding MULTIPLE items to cart at once using the 'Add All to Cart' button.
 * - Customer can remove products from favorites by tapping the heart icon.
 * - Shows an empty state with a call-to-action button when no favorites are saved.
 */

export default function FavoritesScreen({ navigation }) {
  const {
    products,
    favorites,
    toggleFavorite,
    addToCart,
    addMultipleToCart,
    cartCount,
    user,
  } = useGrocery();
  // Keeps content above the phone's navigation bar when opened from the drawer
  const bottomSpace = useBottomSpace();

  // Scroll position drives the shrink/fade animation of favourite cards
  const scrollY = useRef(new Animated.Value(0)).current;

  // Filter products list to only include favorited items
  const favoriteProducts = products.filter((item) => favorites.includes(item.id));

  // Add single item to cart
  const handleAddSingleToCart = (product) => {
    addToCart(product, 1);
    Alert.alert('Cart Updated', `${product.name} (1 ${product.unit}) added to cart!`);
  };

  // Add multiple / all favorites to cart at once (Requirement Part III - ii)
  const handleAddAllToCart = () => {
    if (favoriteProducts.length === 0) {
      Alert.alert('Empty Favorites', 'No items in favorites to add to cart.');
      return;
    }

    addMultipleToCart(favoriteProducts);
    Alert.alert(
      'All Favorites Added!',
      `Added ${favoriteProducts.length} favorite items to your cart!`
    );
  };

  // Header "more" menu: quick actions for the whole favorites list
  const handleMoreMenu = () => {
    Alert.alert('Favourites', 'Choose an action', [
      { text: 'Add All to Cart', onPress: handleAddAllToCart },
      { text: 'Open Menu', onPress: () => navigation.openDrawer() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Render single favorite item card (2-column grid, matching Figma Screen 4)
  const renderFavoriteItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.favoriteCell,
        scrollItemStyle(scrollY, Math.floor(index / 2), FAV_ROW_SIZE, FAV_HEADER_SIZE),
      ]}
    >
    <FadeInUp index={index}>
    <TouchableOpacity
      style={styles.favoriteCard}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    >
      {/* Remove from favorites */}
      <TouchableOpacity style={styles.heartBtn} hitSlop={8} onPress={() => toggleFavorite(item.id)}>
        <Ionicons name="heart" size={18} color={COLORS.accentRed} />
      </TouchableOpacity>

      <Image source={item.image} style={styles.itemImage} resizeMode="contain" />

      <Text style={styles.itemName} numberOfLines={1}>
        {item.name}
      </Text>
      <View style={styles.priceRow}>
        <Text style={styles.itemPrice}>
          Rs {item.price}/{item.unit}
        </Text>
        <TouchableOpacity style={styles.addToCartBtn} onPress={() => handleAddSingleToCart(item)}>
          <Ionicons name="add" size={18} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
    </FadeInUp>
    </Animated.View>
  );

  return (
    <ScreenBackground>
      <ScreenHeader
        title="Favourite"
        left={<IconButton icon="arrow-back" onPress={() => navigation.goBack()} />}
        right={<IconButton icon="ellipsis-vertical" size={22} onPress={handleMoreMenu} />}
      />

      {/* Admin Notice if viewed by admin */}
      {user.role === 'Admin' && (
        <View style={styles.adminBanner}>
          <Ionicons name="information-circle-outline" size={18} color="#856404" />
          <Text style={styles.adminBannerText}>
            Favorite functionality is tailored for Customer users.
          </Text>
        </View>
      )}

      <Animated.FlatList
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        data={favoriteProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderFavoriteItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[styles.listContent, { paddingBottom: 30 + bottomSpace }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          favoriteProducts.length > 0 ? (
            <View style={styles.topBar}>
              <Text style={styles.savedCountText}>
                {favoriteProducts.length} saved item{favoriteProducts.length > 1 ? 's' : ''}
              </Text>
              {/* Part III (ii): Add Multiple to Cart */}
              <TouchableOpacity style={styles.addAllBtn} onPress={handleAddAllToCart}>
                <Ionicons name="bag-add" size={16} color={COLORS.textDark} />
                <Text style={styles.addAllBtnText}>Add All to Cart</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-dislike-outline" size={48} color={COLORS.accentRed} />
            </View>
            <Text style={styles.emptyTitle}>No Favorite Items Yet</Text>
            <Text style={styles.emptyDescription}>
              Tap the heart icon on any grocery product to save it here for quick access and reordering!
            </Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="basket" size={18} color={COLORS.textDark} />
              <Text style={styles.exploreBtnText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF3CD',
    marginHorizontal: 24,
    marginBottom: 10,
    padding: 10,
    borderRadius: 12,
  },
  adminBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  savedCountText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMedium,
  },
  addAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    ...SHADOW,
  },
  addAllBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  columnWrapper: {
    gap: 20,
  },
  favoriteCell: {
    flex: 1,
    maxWidth: '50%',
  },
  favoriteCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 22,
    padding: 14,
    paddingTop: 18,
    marginBottom: 20,
    ...SHADOW,
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: '100%',
    height: 100,
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  addToCartBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 26,
    gap: 8,
  },
  exploreBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
});
