import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders`);
      setOrders(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
      setLoading(false);
    }
  };

  const viewReceipt = (order) => {
    setSelectedOrder(order);
    setShowReceiptModal(true);
  };

  const closeReceiptModal = () => {
    setShowReceiptModal(false);
    setSelectedOrder(null);
  };

  // Receipt Modal Component
  const ReceiptModal = ({ order, onClose }) => {
    if (!order) return null;

    const orderItems = typeof order.order_items === 'string' 
      ? JSON.parse(order.order_items) 
      : order.order_items;

    const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-gray-800">Order Receipt</h2>
              <p className="text-gray-600">Thank you for your purchase</p>
            </div>
            
            <div className="border-t border-b border-gray-200 py-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Order Details</h3>
              <p className="text-sm text-gray-600">Order ID: #{order.id}</p>
              <p className="text-sm text-gray-600">Date: {orderDate}</p>
              <p className="text-sm text-gray-600">Customer: {order.customer_name}</p>
              <p className="text-sm text-gray-600">Email: {order.customer_email}</p>
              {order.customer_address && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Shipping Address:</p>
                  <p className="text-sm text-gray-500">
                    {order.customer_address}<br/>
                    {order.customer_city}, {order.customer_zip}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Items Ordered</h3>
              {orderItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm py-1">
                  <span>{item.name} (x{item.quantity})</span>
                  <span>₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Paid:</span>
                <span>₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(order.total_amount)}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-xl">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8 p-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-black">Your Orders</h1>
              <p className="text-gray-600 mt-2">View your purchase history and receipts</p>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <p className="text-gray-500 text-lg">No orders yet</p>
                <p className="text-gray-400 mb-6">Start shopping to see your orders here</p>
                <a 
                  href="/"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Start Shopping
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-black mb-6">
                  Order History ({orders.length})
                </h2>
                
                {orders.map(order => {
                  const orderItems = typeof order.order_items === 'string' 
                    ? JSON.parse(order.order_items) 
                    : order.order_items;
                  
                  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-black">
                            Order #{order.id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Placed on {orderDate}
                          </p>
                          <p className="text-sm text-gray-600">
                            Status: <span className="text-green-600 font-medium">Completed</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            ₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(order.total_amount)}
                          </p>
                          <button
                            onClick={() => viewReceipt(order)}
                            className="mt-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                          >
                            View Receipt
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Shipped to:</strong> {order.customer_name}
                        </p>
                        {order.customer_address && (
                          <p className="text-sm text-gray-600 mb-3">
                            {order.customer_address}, {order.customer_city} {order.customer_zip}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {orderItems.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center bg-gray-50 rounded px-3 py-1">
                              <span className="text-sm text-gray-700">
                                {item.name} (x{item.quantity})
                              </span>
                            </div>
                          ))}
                          {orderItems.length > 3 && (
                            <div className="flex items-center bg-gray-50 rounded px-3 py-1">
                              <span className="text-sm text-gray-500">
                                +{orderItems.length - 3} more items
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedOrder && (
        <ReceiptModal order={selectedOrder} onClose={closeReceiptModal} />
      )}
    </>
  );
}

export default OrdersPage;