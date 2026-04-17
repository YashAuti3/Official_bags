import React, { createContext, useContext, useReducer, useMemo, useEffect, useRef, useCallback } from 'react';
import { useAppAuth } from './AuthContext';
import { useApi } from 'devil-frontend';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return action.payload;
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [cartItems, dispatch] = useReducer(cartReducer, []);
  const { user } = useAppAuth();
  const { get, post, put } = useApi();
  const hasFetchedCart = useRef(false);

  const fetchCart = useCallback(async () => {
    if (user?.role === 'admin') return; // Double guard
    try {
      const res = await get('/orders/cart');
      if (res.cart) {
        // Map backend items to frontend format
        const items = res.cart.items.map(item => ({
          ...item.product,
          _id: item.product._id,
          id: item.product._id,
          quantity: item.quantity,
          selectedColor: item.selectedColor
        }));
        dispatch({ type: 'SET_CART', payload: items });
      }
    } catch (err) {
      console.error('Failed to fetch persistent cart:', err);
    }
  }, [get, user?.role]);

  // Fetch cart on mount or login
  useEffect(() => {
    // Only fetch cart for regular users (not admins) to save API calls
    if (user && user.role !== 'admin') {
      if (!hasFetchedCart.current) {
        hasFetchedCart.current = true;
        fetchCart();
      }
    } else {
      // Guard: only clear if it was previously fetched or is not empty
      if (hasFetchedCart.current || cartItems.length > 0) {
        hasFetchedCart.current = false;
        dispatch({ type: 'CLEAR_CART' });
      }
    }
  }, [user, fetchCart, cartItems.length]);

  const addToCart = async (product, quantity = 1, selectedColorArg = null) => {
    if (!user) {
      alert('Please login to add items to your cart.');
      return;
    }
    if (user.role === 'admin') {
      alert('Admin accounts cannot add items to cart or make purchases.');
      return;
    }
    const colorValue = typeof selectedColorArg === 'string' ? selectedColorArg : (selectedColorArg?.name || null);

    try {
      const res = await post('/orders/cart/add', {
        productId: product._id || product.id,
        quantity,
        selectedColor: colorValue,
        title: product.title,
        image: product.image,
        price: product.price
      });
      if (res.cart) {
        const items = res.cart.items.map(item => ({
          ...item,
          _id: item.product?._id || item.product,
          id: item.product?._id || item.product,
          title: item.title,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          selectedColor: item.selectedColor
        }));
        dispatch({ type: 'SET_CART', payload: items });
      }
    } catch (err) {
      console.error('Failed to add to persistent cart:', err);
    }
  };

  const removeFromCart = async (id, selectedColorArg = null) => {
    if (!user) return;

    const colorValue =
      typeof selectedColorArg === 'string'
        ? selectedColorArg
        : selectedColorArg?.name || null;

    try {
      const res = await post('/orders/cart/remove', {
        productId: id,
        selectedColor: colorValue,
      });

      // Case 1: cart deleted on backend → clear cart on frontend
      if (!res.cart) {
        dispatch({ type: 'SET_CART', payload: [] });
        return;
      }

      // Case 2: cart still exists → map items as before
      const items = (res.cart.items || []).map((item) => ({
        ...item,
        _id: item.product?._id || item.product,
        id: item.product?._id || item.product,
        title: item.title,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
      }));

      dispatch({ type: 'SET_CART', payload: items });
    } catch (err) {
      console.error('Failed to remove from persistent cart:', err);
    }
  };

  const updateQuantity = async (id, quantity, selectedColorArg = null) => {
    if (!user) return;
    const colorValue = typeof selectedColorArg === 'string' ? selectedColorArg : (selectedColorArg?.name || null);

    try {
      const res = await put('/orders/cart/update', {
        productId: id,
        quantity,
        selectedColor: colorValue
      });
      if (res.cart) {
        const items = res.cart.items.map(item => ({
          ...item.product,
          _id: item.product._id,
          id: item.product._id,
          quantity: item.quantity,
          selectedColor: item.selectedColor
        }));
        dispatch({ type: 'SET_CART', payload: items });
      }
    } catch (err) {
      console.error('Failed to update cart quantity:', err);
    }
  };

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);
  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
