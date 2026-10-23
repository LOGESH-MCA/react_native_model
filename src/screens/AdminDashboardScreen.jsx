import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '../theme/colors';
import { ScreenBackground, useBottomSpace } from '../components/UI';
import { KeyboardAwareOverlay, KeyboardInput } from '../components/KeyboardAware';
import { useGrocery } from '../context/GroceryContext';

/**
 * Admin Dashboard & Inventory Screen (Admin Role Only)
 * 
 * Explanation for Viva:
 * - Since Cart, Profile, and Favorites are for Customers,
 *   the Admin user gets this dedicated Inventory Dashboard.
 * - Displays total inventory stats: Product count, total stock, and low stock warnings.
 * - Allows updating product prices and restocking items with basic validation.
 */

export default function AdminDashboardScreen({ navigation }) {
  const {
    products,
    user,
    updateProductPrice,
    updateProductStock,
  } = useGrocery();
  // Keeps content above the phone's navigation bar when opened from the drawer
  const bottomSpace = useBottomSpace();

  // Modal for editing stock & price
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  // Open edit modal
  const handleOpenEdit = (item) => {
    setSelectedProduct(item);
    setEditPrice(item.price.toString());
    setEditStock(item.stock.toString());
  };

  // Save changes with validation
  const handleSave = () => {
    if (!editPrice || isNaN(editPrice) || Number(editPrice) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price greater than 0');
      return;
    }
    if (!editStock || isNaN(editStock) || Number(editStock) < 0) {
      Alert.alert('Validation Error', 'Please enter a valid non-negative stock count');
      return;
    }

    updateProductPrice(selectedProduct.id, Number(editPrice));
    updateProductStock(selectedProduct.id, Number(editStock));
    Alert.alert('Success', `Updated ${selectedProduct.name} price & inventory!`);
    setSelectedProduct(null);
  };

  // Quick stats
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock < 30).length;

  const renderAdminProduct = ({ item }) => (
    <View style={styles.productRow}>
      <Image source={item.image} style={styles.productImg} resizeMode="contain" />

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.categoryName}>{item.category}</Text>
        <Text style={styles.priceText}>
          Rs {item.price} / {item.unit}
        </Text>
      </View>

      <View style={styles.stockCol}>
        <View
          style={[
            styles.stockPill,
            item.stock < 30 ? styles.stockPillLow : styles.stockPillGood,
          ]}
        >
          <Text
            style={[
              styles.stockPillText,
              item.stock < 30 ? styles.stockPillTextLow : styles.stockPillTextGood,
            ]}
          >
            {item.stock} in stock
          </Text>
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => handleOpenEdit(item)}
        >
          <Ionicons name="create-outline" size={14} color={COLORS.textDark} />
          <Text style={styles.editBtnText}>Manage</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => navigation.openDrawer()}
          >
            <Ionicons name="menu-outline" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <View style={{ width: 52 }} />
        </View>

        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderAdminProduct}
          contentContainerStyle={[styles.listContent, { paddingBottom: 30 + bottomSpace }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Admin Info Banner */}
              <View style={styles.adminBanner}>
                <View style={styles.adminBannerLeft}>
                  <Ionicons name="shield-checkmark" size={24} color="#856404" />
                  <View>
                    <Text style={styles.adminBannerTitle}>Admin Control Center</Text>
                    <Text style={styles.adminBannerSub}>
                      Manage daily grocery prices, stock levels & catalog
                    </Text>
                  </View>
                </View>
              </View>

              {/* Stats Cards */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="cube-outline" size={20} color={COLORS.secondary} />
                  <Text style={styles.statNumber}>{totalProducts}</Text>
                  <Text style={styles.statLabel}>Total Products</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="layers-outline" size={20} color="#2980B9" />
                  <Text style={styles.statNumber}>{totalStock} kg</Text>
                  <Text style={styles.statLabel}>Available Stock</Text>
                </View>

                <View style={[styles.statCard, { borderColor: '#FFAAAA' }]}>
                  <Ionicons name="alert-circle-outline" size={20} color={COLORS.accentRed} />
                  <Text style={[styles.statNumber, { color: COLORS.accentRed }]}>
                    {lowStockCount}
                  </Text>
                  <Text style={styles.statLabel}>Low Stock Items</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Inventory Products Catalog</Text>
            </>
          }
        />

        {/* Edit Product Price & Stock Modal */}
        {selectedProduct && (
          <Modal
            visible={true}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setSelectedProduct(null)}
          >
            <KeyboardAwareOverlay>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Manage {selectedProduct.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                    <Ionicons name="close" size={22} color={COLORS.textDark} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalLabel}>
                  Price per {selectedProduct.unit} (Rs):
                </Text>
                <KeyboardInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={editPrice}
                  onChangeText={setEditPrice}
                />

                <Text style={styles.modalLabel}>
                  Available Stock ({selectedProduct.unit}):
                </Text>
                <KeyboardInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={editStock}
                  onChangeText={setEditStock}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setSelectedProduct(null)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>Update Inventory</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAwareOverlay>
          </Modal>
        )}
      </View>
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
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  switchRoleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  adminBanner: {
    backgroundColor: '#FFF3CD',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFEEBA',
    marginBottom: 14,
  },
  adminBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#856404',
  },
  adminBannerSub: {
    fontSize: 11,
    color: '#66512C',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 3,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: COLORS.background,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  categoryName: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  stockCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  stockPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stockPillGood: {
    backgroundColor: COLORS.secondaryLight,
  },
  stockPillLow: {
    backgroundColor: '#FFE6E6',
  },
  stockPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stockPillTextGood: {
    color: COLORS.secondary,
  },
  stockPillTextLow: {
    color: COLORS.accentRed,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    gap: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalLabel: {
    fontSize: 12,
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
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#EAE6D6',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontWeight: '700',
    color: COLORS.textMedium,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    fontWeight: '800',
    color: COLORS.textDark,
  },
});
