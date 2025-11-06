import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

function CheckoutPage() {
  const { cartItems, getTotalAmount, clearCart, loading: cartLoading } = useCart();
  const navigate = useNavigate();

  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: ''
  });

  // State for loading, success, and error
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.zip) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      // Prepare cart items for checkout
      const checkoutItems = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl
      }));

      // Submit order to backend
      const response = await axios.post(`${API_BASE_URL}/api/checkout`, {
        customerInfo: formData,
        cartItems: checkoutItems
      });

      // Set receipt data and show modal
      setReceipt(response.data.receipt);
      setShowReceiptModal(true);
      
      // Clear the cart through context (will also refresh from backend)
      await clearCart();
      
    } catch (err) {
      console.error('Error placing order:', err);
      setError('There was a problem placing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Receipt Modal Component
  const ReceiptModal = ({ receipt, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto animate-modal-in">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
            <p className="text-gray-600">Thank you for your purchase</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Order Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono font-semibold">#{receipt.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{receipt.orderDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{receipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{receipt.customerEmail}</span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Items Ordered
            </h3>
            <div className="space-y-3">
              {receipt.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <div className="flex-grow">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span className="text-gray-500 text-sm ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-semibold text-gray-900">₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0 }).format(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">Total Paid:</span>
              <span className="text-2xl font-bold text-blue-600">₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0 }).format(receipt.total)}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                onClose();
                navigate('/orders');
              }}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              View Orders
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/');
              }}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-black">Loading checkout...</h2>
          <p className="text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-2">Checkout</h1>
            <p className="text-gray-600">Complete your order details</p>
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
              <div className="text-gray-400 text-8xl mb-6">🛒</div>
              <h2 className="text-2xl font-bold text-black mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Please add items to your cart before proceeding to checkout.
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Checkout Form */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-black">Shipping Information</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className="block text-black text-sm font-semibold mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-black text-sm font-semibold mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-black text-sm font-semibold mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="123 Main Street"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-black text-sm font-semibold mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Manila"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="zip" className="block text-black text-sm font-semibold mb-2">
                        Zip Code *
                      </label>
                      <input
                        type="text"
                        id="zip"
                        name="zip"
                        value={formData.zip}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="1000"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate('/cart')}
                      className="flex-1 px-6 py-3 bg-gray-200 text-black rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold"
                    >
                      Back to Cart
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Order Summary */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-fit sticky top-24">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-black">Order Summary</h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {cartItems.map(item => (
                      <div key={item.cart_item_id} className="flex items-center space-x-4">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-grow">
                          <h3 className="font-medium text-black text-sm">{item.name}</h3>
                          <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-black">
                          ₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0 }).format(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0 }).format(getTotalAmount())}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">FREE</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-black pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0 }).format(getTotalAmount())}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && receipt && (
        <ReceiptModal 
          receipt={receipt} 
          onClose={() => {
            setShowReceiptModal(false);
            navigate('/');
          }} 
        />
      )}

      <style jsx>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default CheckoutPage;