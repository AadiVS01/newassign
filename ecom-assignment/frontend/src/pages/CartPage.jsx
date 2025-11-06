import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/imageUtils';

function CartPage() {
  const { cartItems, loading, removeFromCart, updateCartItem, clearCart, getTotalAmount } = useCart();
  const [updatingItems, setUpdatingItems] = useState({});
  const navigate = useNavigate();

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => ({ ...prev, [cartItemId]: true }));
    
    try {
      await updateCartItem(cartItemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item. Please try again.');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
        alert('Failed to clear cart. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-black">Loading your cart...</h2>
          <p className="text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-light text-black mb-4">Shopping Cart</h1>
          <p className="text-gray-600 text-lg">Review your selected items and complete your order</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-gray-100 p-20 text-center">
            <div className="text-gray-300 text-9xl mb-8">🛒</div>
            <h2 className="text-3xl font-light text-black mb-6">Your cart is empty</h2>
            <p className="text-gray-600 mb-12 max-w-md mx-auto text-lg leading-relaxed">
              Discover our curated collection of premium technology products and add items to your cart.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-black text-white px-12 py-4 rounded-none hover:bg-gray-900 transition-all duration-300 font-light tracking-wide text-base"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
            {/* Cart Items */}
            <div className="xl:col-span-2">
              <div className="bg-white border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100">
                  <h2 className="text-2xl font-light text-black">Items ({cartItems.length})</h2>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <div key={item.cart_item_id} className="p-8 hover:bg-gray-50 transition-colors duration-300">
                      <div className="flex items-start space-x-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={getOptimizedImageUrl(item.imageUrl, 120, 120)}
                              alt={item.name}
                              className="w-32 h-32 object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-32 h-32 flex items-center justify-center bg-gray-100">
                              <span className="text-gray-400 text-sm">No Image</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-grow min-w-0 space-y-4">
                          <div>
                            <h3 className="text-xl font-light text-black mb-2">{item.name}</h3>
                            <p className="text-gray-600 text-sm uppercase tracking-wider">Technology</p>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-6">
                            <span className="text-sm text-gray-600 uppercase tracking-wider">Quantity</span>
                            <div className="flex items-center border border-gray-200">
                              <button
                                onClick={() => handleQuantityChange(item.cart_item_id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || updatingItems[item.cart_item_id]}
                                className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="w-16 h-12 flex items-center justify-center border-x border-gray-200 font-light text-lg">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.cart_item_id, item.quantity + 1)}
                                disabled={updatingItems[item.cart_item_id]}
                                className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                            {updatingItems[item.cart_item_id] && (
                              <div className="w-4 h-4 border border-gray-300 border-t-black rounded-full animate-spin"></div>
                            )}
                          </div>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex flex-col items-end justify-between h-32">
                          <button
                            onClick={() => handleRemoveItem(item.cart_item_id)}
                            className="text-gray-400 hover:text-black transition-colors duration-200 p-2"
                            title="Remove item"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">
                              ₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(item.price)} each
                            </p>
                            <p className="text-xl font-light text-black">
                              ₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="xl:col-span-1">
              <div className="bg-white border border-gray-100 sticky top-24">
                <div className="p-8 border-b border-gray-100">
                  <h2 className="text-2xl font-light text-black">Order Summary</h2>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="flex justify-between text-gray-600">
                    <span className="font-light">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span className="font-light">₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(getTotalAmount())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="font-light">Shipping</span>
                    <span className="text-green-600 font-light">Complimentary</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="font-light">Tax</span>
                    <span className="font-light">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-gray-100 pt-6">
                    <div className="flex justify-between text-2xl font-light text-black">
                      <span>Total</span>
                      <span>₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(getTotalAmount())}</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-gray-50 space-y-4">
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-black text-white py-4 rounded-none hover:bg-gray-900 transition-all duration-300 font-light tracking-wide text-base"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full text-gray-600 py-3 rounded-none hover:text-black border border-gray-200 hover:bg-white transition-all duration-300 font-light tracking-wide"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={handleClearCart}
                    className="w-full text-gray-400 py-2 hover:text-red-600 transition-all duration-300 font-light text-sm"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
