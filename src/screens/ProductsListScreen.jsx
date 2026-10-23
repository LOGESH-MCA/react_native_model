import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOW } from '../theme/colors';
import { ScreenBackground, IconButton } from '../components/UI';
import { KeyboardAwareOverlay, KeyboardInput } from '../components/KeyboardAware';
import { FadeInUp } from '../components/Animations';
import { useGrocery } from '../context/GroceryContext';

/**
 * Screen 2: Daily Grocery Food Products List Screen (Admin and Customers)
 * 
 * Explanation for Viva:
 * - This screen displays all daily grocery food items in a grid/list.
 * - Supports real-time search and category filtering ('All', 'Fresh fruits', 'Fresh vegetables').
 * - Fulfills Requirement Part III (ii): Add single product to cart directly from this screen.
 * - Customer can toggle items to Favorites.
 * - If logged in as Admin, shows stock indicators and provides an 'Edit Price / Stock' modal.
 */

export default function ProductsListScreen({ navigation }) {
  const {
    products,
    user,
    cartCount,
    toggleFavorite,
    isFavorite,
    addToCart,
    updateProductPrice,
    updateProductStock,
  } = useGrocery();

  // Search and Category Filter States
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  // Category buttons: exactly 2 fit next to the arrow, so none is cut off at the edge
  const categoryScrollRef = useRef(null);
  const [categoriesAtEnd, setCategoriesAtEnd] = useState(false);
  const CATEGORY_GAP = 12;
  const ARROW_SIZE = 44;
  const categoryAreaWidth = screenWidth - 48 - ARROW_SIZE - 10; // 48 = page padding, 10 = space before arrow
  const pillWidth = (categoryAreaWidth - CATEGORY_GAP) / 2;

  const onCategoryArrow = () => {
    if (categoriesAtEnd) categoryScrollRef.current?.scrollTo({ x: 0, animated: true });
    else categoryScrollRef.current?.scrollToEnd({ animated: true });
  };
  // Scroll position drives the header parallax animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerAnimatedStyle = {
    opacity: scrollY.interpolate({ inputRange: [0, 140], outputRange: [1, 0.2], extrapolate: 'clamp' }),
    transform: [
      { translateY: scrollY.interpolate({ inputRange: [-100, 0, 140], outputRange: [-30, 0, 60], extrapolate: 'clamp' }) },
      { scale: scrollY.interpolate({ inputRange: [-100, 0, 140], outputRange: [1.1, 1, 0.9], extrapolate: 'clamp' }) },
    ],
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Fresh fruits');

  // Admin Edit Modal States
  const [editingProduct, setEditingProduct] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');

  // Categories list matching Figma design
  const categories = [
    { label: 'Fruits', value: 'Fresh fruits' },
    { label: 'Vegetables', value: 'Fresh vegetables' },
    { label: 'All Items', value: 'All' },
  ];

  // Filter products based on selected category and search input
  const filteredProducts = products.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle Quick Add to Cart
  const handleAddToCart = (product) => {
    addToCart(product, 1);
    Alert.alert('Added to Cart', `${product.name} (1 ${product.unit}) added to your cart!`);
  };

  // Open Admin Edit Modal
  const openAdminEdit = (product) => {
    setEditingProduct(product);
    setNewPrice(product.price.toString());
    setNewStock(product.stock.toString());
  };

  // Save Admin changes
  const saveAdminChanges = () => {
    if (!newPrice || isNaN(newPrice) || Number(newPrice) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive price');
      return;
    }
    if (!newStock || isNaN(newStock) || Number(newStock) < 0) {
      Alert.alert('Validation Error', 'Please enter a valid stock count');
      return;
    }

    updateProductPrice(editingProduct.id, Number(newPrice));
    updateProductStock(editingProduct.id, Number(newStock));
    Alert.alert('Success', `Updated ${editingProduct.name} successfully!`);
    setEditingProduct(null);
  };

  const headline =
    selectedCategory === 'Fresh vegetables'
      ? 'Found more\nvegetables !'
      : selectedCategory === 'Fresh fruits'
      ? 'Found more\nfruits !'
      : 'Found more\nfresh food !';

  // Render Single Product Card (matching Figma Screen 2 / 3)
  const renderProductCard = (item, index) => {
    const favorited = isFavorite(item.id);

    return (
      <FadeInUp key={`${selectedCategory}-${item.id}`} index={index} style={styles.gridItem}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
      >
        {/* Favorite Heart Button */}
        <TouchableOpacity
          style={styles.favoriteBadge}
          onPress={() => toggleFavorite(item.id)}
          hitSlop={8}
        >
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={18}
            color={favorited ? COLORS.accentRed : COLORS.textLight}
          />
        </TouchableOpacity>

        <Image
          source={item.image}
          style={styles.productImage}
          resizeMode="contain"
        />

        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>

        <View style={styles.priceRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.priceValue}>
              Rs {item.price}/{item.unit}
            </Text>
            {user.role === 'Admin' && (
              <Text style={styles.stockText}>Stock: {item.stock} {item.unit}</Text>
            )}
          </View>

          {/* If Admin: show Edit button; If Customer: show Add to Cart */}
          {user.role === 'Admin' ? (
            <TouchableOpacity style={styles.adminEditBtn} onPress={() => openAdminEdit(item)}>
              <Ionicons name="pencil" size={14} color={COLORS.textDark} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.addCartBtn} onPress={() => handleAddToCart(item)}>
              <Ionicons name="add" size={18} color={COLORS.textDark} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
      </FadeInUp>
    );
  };

  return (
    <ScreenBackground>
      <Animated.ScrollView
        contentContainerStyle={[styles.listContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
      >
        {/* Header: big title + menu & search buttons (parallax on scroll) */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Hi {user.name} 👋</Text>
            <Text style={styles.title}>Daily{'\n'}Grocery Food</Text>
          </View>
          <View style={styles.headerButtons}>
            <IconButton icon="menu" onPress={() => navigation.openDrawer()} />
            <IconButton
              icon={showSearch ? 'close' : 'search'}
              onPress={() => {
                setShowSearch(!showSearch);
                setSearchQuery('');
              }}
            />
          </View>
        </Animated.View>

        {/* Search Bar (opens from the search button) */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={COLORS.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search fruits, vegetables..."
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        )}

        {/* Category Pills Selector */}
        <View style={styles.categoryBar}>
          <ScrollView
            ref={categoryScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={pillWidth + CATEGORY_GAP}
            decelerationRate="fast"
            scrollEventThrottle={16}
            onScroll={(e) => {
              const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
              setCategoriesAtEnd(contentOffset.x + layoutMeasurement.width >= contentSize.width - 4);
            }}
            contentContainerStyle={[styles.categoryRow, { gap: CATEGORY_GAP }]}
            style={{ width: categoryAreaWidth }}
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat.value;
              return (
                <TouchableOpacity
                  key={cat.value}
                  style={[styles.categoryPill, { width: pillWidth }, active && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(cat.value)}
                >
                  <Text style={styles.categoryPillText} numberOfLines={1} adjustsFontSizeToFit>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Arrow shows there are more categories; flips back at the end */}
          <TouchableOpacity style={styles.categoryArrow} onPress={onCategoryArrow} activeOpacity={0.8}>
            <Ionicons
              name={categoriesAtEnd ? 'chevron-back' : 'chevron-forward'}
              size={22}
              color={COLORS.textDark}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{headline}</Text>

        {/* Two-column product grid */}
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or category filter</Text>
          </View>
        ) : (
          /* Even 2-column grid: cards sit side by side in aligned rows */
          <View style={styles.grid}>
            {filteredProducts.map((item, index) => renderProductCard(item, index))}
          </View>
        )}
      </Animated.ScrollView>
      {/* Admin Price & Stock Edit Modal */}
      {editingProduct && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setEditingProduct(null)}
        >
          <KeyboardAwareOverlay>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Product: {editingProduct.name}</Text>
                <TouchableOpacity onPress={() => setEditingProduct(null)}>
                  <Ionicons name="close" size={24} color={COLORS.textDark} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Price per {editingProduct.unit} (Rs):</Text>
              <KeyboardInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={newPrice}
                onChangeText={setNewPrice}
              />

              <Text style={styles.modalLabel}>Stock available ({editingProduct.unit}):</Text>
              <KeyboardInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={newStock}
                onChangeText={setNewStock}
              />

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#E0DDD0' }]}
                  onPress={() => setEditingProduct(null)}
                >
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: COLORS.primary }]}
                  onPress={saveAdminChanges}
                >
                  <Text style={[styles.modalBtnText, { color: COLORS.textDark }]}>
                    Save Changes
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareOverlay>
        </Modal>
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMedium,
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 18,
    gap: 10,
    ...SHADOW,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    padding: 0,
  },
  categoryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  categoryRow: {
    paddingVertical: 6,
  },
  categoryArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 26,
    backgroundColor: COLORS.pillInactive,
    alignItems: 'center',
    ...SHADOW,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
  },
  categoryPillText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
    marginTop: 18,
  },
  gridItem: {
    width: '47.5%',
  },
  productCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 22,
    padding: 14,
    paddingTop: 18,
    ...SHADOW,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: 110,
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  priceValue: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  stockText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  addCartBtn: {
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminEditBtn: {
    backgroundColor: COLORS.tabBar,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  emptySubtext: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.textDark,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnText: {
    fontWeight: '700',
    fontSize: 14,
    color: COLORS.textMedium,
  },
});
