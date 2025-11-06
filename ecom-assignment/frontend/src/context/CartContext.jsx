import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// Create Cart Context
export const CartContext = createContext();

// Create Cart Provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch cart data from backend
  const fetchCartData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cart`);
      const { items, total, totalItems: itemCount } = response.data.data;
      setCartItems(items);
      setTotalAmount(total);
      setTotalItems(itemCount);
    } catch (error) {
      console.error('Error fetching cart:', error);
      // If backend is not available, fallback to localStorage
      try {
        const localCart = localStorage.getItem('cartItems');
        const items = localCart ? JSON.parse(localCart) : [];
        setCartItems(items);
        setTotalAmount(items.reduce((sum, item) => sum + (item.price * item.quantity), 0));
        setTotalItems(items.reduce((sum, item) => sum + item.quantity, 0));
      } catch (localError) {
        console.error("Error parsing cart from localStorage:", localError);
        setCartItems([]);
        setTotalAmount(0);
        setTotalItems(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load cart data on component mount
  useEffect(() => {
    fetchCartData();
  }, []);

  // Function to add item to cart (backend integration)
  const addToCart = async (product) => {
    try {
      await axios.post(`${API_BASE_URL}/api/cart`, {
        productId: product.id,
        quantity: 1
      });
      
      // Refresh cart data
      await fetchCartData();
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback to localStorage if backend fails
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);
        let newItems;
        if (existingItem) {
          newItems = prevItems.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          newItems = [...prevItems, { ...product, quantity: 1 }];
        }
        localStorage.setItem('cartItems', JSON.stringify(newItems));
        return newItems;
      });
    }
  };

  // Function to remove item from cart (backend integration)
  const removeFromCart = async (cartItemId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/cart/${cartItemId}`);
      
      // Refresh cart data
      await fetchCartData();
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Fallback to localStorage if backend fails
      setCartItems((prevItems) => {
        const newItems = prevItems.filter((item) => item.cart_item_id !== cartItemId);
        localStorage.setItem('cartItems', JSON.stringify(newItems));
        return newItems;
      });
    }
  };

  // Function to update cart item quantity
  const updateCartItem = async (cartItemId, quantity) => {
    try {
      await axios.put(`${API_BASE_URL}/api/cart/${cartItemId}`, { quantity });
      
      // Refresh cart data
      await fetchCartData();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  };

  // Function to clear entire cart
  const clearCart = async () => {
    try {
      // Delete all items one by one (since we don't have a bulk delete endpoint)
      for (const item of cartItems) {
        await axios.delete(`${API_BASE_URL}/api/cart/${item.cart_item_id}`);
      }
      
      // Refresh cart data
      await fetchCartData();
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Fallback to localStorage if backend fails
      setCartItems([]);
      localStorage.setItem('cartItems', JSON.stringify([]));
    }
  };

  // Function to refresh cart (useful for external calls)
  const refreshCart = () => {
    fetchCartData();
  };

  // Calculate total items (for navbar display)
  const getTotalItems = () => {
    return totalItems;
  };

  // Calculate total amount
  const getTotalAmount = () => {
    return totalAmount;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        refreshCart,
        getTotalItems,
        getTotalAmount,
        totalAmount,
        totalItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context easily
export const useCart = () => {
  return useContext(CartContext);
};
