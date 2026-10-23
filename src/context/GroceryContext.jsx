import React, { createContext, useState, useContext } from 'react';
import { INITIAL_PRODUCTS } from '../data/productsData';
import { authenticate, registerCustomer, saveProfile } from '../services/userStorage';

/**
 * Grocery Context (Global State Management)
 * 
 * Explanation for Viva:
 * React Context API allows us to manage global state (User, Cart, Favorites, Products)
 * without passing props down manually through multiple component levels (avoiding 'prop drilling').
 * Any screen can simply call `useGrocery()` to access or update cart, favorites, or user info.
 */

const GroceryContext = createContext();

export const GroceryProvider = ({ children }) => {
  // 1. Current User State (Two roles: 'Customer' or 'Admin')
  // Filled from users.json after a successful Sign In / Sign Up
  const EMPTY_USER = {
    id: null,
    name: 'Logesh',
    email: '',
    phone: '',
    address: '',
    role: 'Customer', // 'Customer' or 'Admin'
    isLoggedIn: false,
  };
  const [user, setUser] = useState(EMPTY_USER);

  // 2. Products state (Admin can edit price or stock)
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  // 3. Favorites state (stores product IDs favorited by customer)
  // Starts empty: only items the customer hearts are shown (no dummy data)
  const [favorites, setFavorites] = useState([]);

  // 4. Cart state (stores items with { product, quantity, weight })
  const [cart, setCart] = useState([]);

  // 5. Promo code discount state
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');

  // -------------------------------------------------------------
  // AUTHENTICATION FUNCTIONS
  // -------------------------------------------------------------
  // Sign In: verifies email + password against users.json.
  // The role (Admin / Customer) is read from the matching account.
  const login = async (email, password) => {
    const result = await authenticate(email, password);
    if (result.success) {
      setUser({ ...result.user, isLoggedIn: true });
    }
    return result;
  };

  // Sign Up: only customers can register; saved into users.json on the device
  const signup = async (name, email, phone, password) => {
    const result = await registerCustomer({ name, email, phone, password });
    if (result.success) {
      setUser({ ...result.user, isLoggedIn: true });
    }
    return result;
  };

  // Sign Out: clear the session so the next person starts fresh
  const logout = () => {
    setUser(EMPTY_USER);
    setFavorites([]);
    setCart([]);
    setDiscountPercent(0);
    setAppliedPromo('');
  };

  // Update Customer Profile (Requirement Part I - Screen 3)
  const updateProfile = (updatedData) => {
    setUser((prev) => ({
      ...prev,
      ...updatedData,
    }));
    saveProfile(user.id, updatedData);
  };

  // -------------------------------------------------------------
  // FAVORITES FUNCTIONS (Requirement Part I - Screen 4)
  // -------------------------------------------------------------
  const toggleFavorite = (productId) => {
    setFavorites((prev) => {
      if (prev.includes(productId)) {
        // Remove from favorites
        return prev.filter((id) => id !== productId);
      } else {
        // Add to favorites
        return [...prev, productId];
      }
    });
  };

  const isFavorite = (productId) => {
    return favorites.includes(productId);
  };

  // -------------------------------------------------------------
  // CART FUNCTIONS (Requirement Part III - Functional Requirements)
  // -------------------------------------------------------------
  
  // (ii) Add single product to cart (from Products or Favorites screen)
  const addToCart = (product, quantity = 1, weight = '1kg') => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex > -1) {
        // Product already in cart, increase quantity (new object, no mutation)
        return prevCart.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        // New item, add to cart
        return [...prevCart, { product, quantity, weight }];
      }
    });
  };

  // (ii) Add multiple products to cart (e.g. from Favorites screen: "Add All to Cart")
  const addMultipleToCart = (productsList) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart];

      productsList.forEach((prod) => {
        const existingIndex = updatedCart.findIndex(
          (item) => item.product.id === prod.id
        );
        if (existingIndex > -1) {
          updatedCart[existingIndex] = {
            ...updatedCart[existingIndex],
            quantity: updatedCart[existingIndex].quantity + 1,
          };
        } else {
          updatedCart.push({ product: prod, quantity: 1, weight: '1kg' });
        }
      });

      return updatedCart;
    });
  };

  // (iii) Add / increase item quantity in cart
  const increaseQuantity = (productId) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );
  };

  // (iii) Subtract / decrease item quantity in cart
  const decreaseQuantity = (productId) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0); // If quantity drops to 0, remove item
    });
  };

  // Remove single item from cart
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  // Clear entire cart after successful checkout
  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setAppliedPromo('');
  };

  // Apply promo coupon (e.g., GROCERY20 gives 20% discount)
  const applyPromo = (code) => {
    if (code.toUpperCase().trim() === 'GROCERY20') {
      setDiscountPercent(20);
      setAppliedPromo('GROCERY20');
      return { success: true, message: '20% Discount Applied Successfully!' };
    }
    return { success: false, message: 'Invalid promo code. Use: GROCERY20' };
  };

  // -------------------------------------------------------------
  // ADMIN FUNCTIONS (Update price or stock)
  // -------------------------------------------------------------
  const updateProductPrice = (productId, newPrice) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price: Number(newPrice) } : p))
    );
  };

  const updateProductStock = (productId, newStock) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Number(newStock) } : p))
    );
  };

  // -------------------------------------------------------------
  // CALCULATIONS (Subtotal, Delivery Fee, Total)
  // -------------------------------------------------------------
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discountAmount = (cartSubtotal * discountPercent) / 100;
  // Free delivery if subtotal > 500, else Rs 40 (standard delivery fee)
  const deliveryFee = cartSubtotal > 500 || cartSubtotal === 0 ? 0 : 40;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + deliveryFee);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <GroceryContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateProfile,
        products,
        updateProductPrice,
        updateProductStock,
        favorites,
        toggleFavorite,
        isFavorite,
        cart,
        addToCart,
        addMultipleToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        discountPercent,
        discountAmount,
        appliedPromo,
        deliveryFee,
        grandTotal,
        applyPromo,
      }}
    >
      {children}
    </GroceryContext.Provider>
  );
};

// Custom hook to consume the GroceryContext easily in any screen
export const useGrocery = () => useContext(GroceryContext);
