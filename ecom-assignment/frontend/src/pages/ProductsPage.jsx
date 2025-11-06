import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getOptimizedImageUrl } from '../utils/imageUtils';

const API_BASE_URL = 'http://localhost:3001';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const { refreshCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products`);
        setProducts(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Unable to connect to server. Please make sure the backend is running on port 3001.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    setAddingToCart(prev => ({ ...prev, [product.id]: true }));
    
    try {
      await axios.post(`${API_BASE_URL}/api/cart`, {
        productId: product.id,
        quantity: 1
      });
      
      // Refresh cart data
      if (refreshCart) {
        refreshCart();
      }
      
      // Show success feedback
      console.log(`Added ${product.name} to cart`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-black">Loading amazing products...</h2>
          <p className="text-gray-500 mt-2">This won't take long</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="text-center p-8 bg-white border border-gray-200 rounded-xl shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-black mb-2">Connection Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              New Collection Available
            </div>
            <h1 className="text-6xl md:text-7xl font-light text-black mb-8 leading-tight tracking-tight">
              Premium
              <span className="block font-medium">Technology</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
              Discover carefully curated technology products designed for modern professionals who demand excellence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="bg-black text-white px-8 py-4 rounded-none text-base font-medium hover:bg-gray-900 transition-all duration-300 min-w-[200px]">
                Explore Collection
              </button>
              <button className="border border-gray-300 text-black px-8 py-4 rounded-none text-base font-medium hover:bg-gray-50 transition-all duration-300 min-w-[200px]">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-light text-black mb-2">Featured Products</h2>
              <p className="text-gray-600">Handpicked selection of premium technology</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button className="px-4 py-2 text-sm text-gray-600 hover:text-black border-b-2 border-transparent hover:border-gray-300 transition-all duration-300">
                All
              </button>
              <button className="px-4 py-2 text-sm text-gray-600 hover:text-black border-b-2 border-transparent hover:border-gray-300 transition-all duration-300">
                Smartphones
              </button>
              <button className="px-4 py-2 text-sm text-gray-600 hover:text-black border-b-2 border-transparent hover:border-gray-300 transition-all duration-300">
                Laptops
              </button>
              <button className="px-4 py-2 text-sm text-gray-600 hover:text-black border-b-2 border-transparent hover:border-gray-300 transition-all duration-300">
                Accessories
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <div
              key={product.id}
              className="group bg-white rounded-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100"
            >
              {/* Product Image */}
              <div className="relative overflow-hidden aspect-[4/3] bg-gray-50">
                {product.imageUrl ? (
                  <img
                    src={getOptimizedImageUrl(product.imageUrl, 600, 400)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                
                {/* Quick Actions */}
                <div className="absolute top-6 right-6 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link 
                    to={`/products/${product.id}`}
                    className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-300 shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                  <button className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-300 shadow-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-8">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Technology</p>
                  <Link to={`/products/${product.id}`} className="block">
                    <h3 className="text-xl font-light text-black mb-3 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                </div>
                
                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-2xl font-light text-black">
                    ₹{product.price.toLocaleString('en-IN')}
                  </div>
                  
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addingToCart[product.id]}
                    className="bg-black text-white px-6 py-3 rounded-none hover:bg-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium tracking-wide min-w-[120px]"
                  >
                    {addingToCart[product.id] ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                      </>
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-light text-black mb-4">Why Choose TechStore</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to delivering exceptional experiences through premium products and unmatched service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:bg-blue-50 transition-colors duration-300">
                <svg className="w-10 h-10 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-light text-black mb-4">Fast Delivery</h3>
              <p className="text-gray-600 leading-relaxed">
                Complimentary shipping on all orders over ₹2,000 with express delivery options available.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:bg-blue-50 transition-colors duration-300">
                <svg className="w-10 h-10 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-light text-black mb-4">Quality Guaranteed</h3>
              <p className="text-gray-600 leading-relaxed">
                Every product comes with our 30-day satisfaction guarantee and comprehensive warranty coverage.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:bg-blue-50 transition-colors duration-300">
                <svg className="w-10 h-10 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-light text-black mb-4">Expert Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Our dedicated team of technology experts is available around the clock to assist you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
