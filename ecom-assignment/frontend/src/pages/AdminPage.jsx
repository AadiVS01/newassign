import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageUploader from '../components/ImageUploader';
import { getOptimizedImageUrl } from '../utils/imageUtils';

const API_BASE_URL = 'http://localhost:3001';

function AdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      alert('Name and price are required');
      return;
    }

    try {
      if (editingProduct) {
        await axios.put(`${API_BASE_URL}/api/products/${editingProduct.id}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/api/products`, formData);
      }
      
      setFormData({ name: '', price: '', description: '', imageUrl: '' });
      setEditingProduct(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || '',
      imageUrl: product.imageUrl || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', description: '', imageUrl: '' });
    setEditingProduct(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
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
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="mb-16">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-5xl font-light text-black mb-4">Product Management</h1>
              <p className="text-gray-600 text-lg">Manage your technology product catalog</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-black hover:bg-gray-900 text-white px-8 py-4 rounded-none font-light tracking-wide text-base transition-colors duration-200"
            >
              Add New Product
            </button>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8 z-50">
            <div className="bg-white max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-12">
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-3xl font-light text-black">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-black text-3xl font-light"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label className="block text-sm uppercase tracking-wider text-gray-600 mb-3">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-0 py-4 border-0 border-b border-gray-200 focus:outline-none focus:border-black bg-transparent text-lg font-light transition-colors"
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm uppercase tracking-wider text-gray-600 mb-3">
                      Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-0 py-4 border-0 border-b border-gray-200 focus:outline-none focus:border-black bg-transparent text-lg font-light transition-colors"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm uppercase tracking-wider text-gray-600 mb-3">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-0 py-4 border-0 border-b border-gray-200 focus:outline-none focus:border-black bg-transparent text-lg font-light transition-colors resize-none"
                      placeholder="Enter product description"
                    />
                  </div>

                  <div>
                    <ImageUploader
                      currentImage={formData.imageUrl}
                      onImageChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                      label="Product Image"
                    />
                  </div>

                  <div className="flex justify-end space-x-6 mt-12 pt-8 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-8 py-3 text-gray-600 hover:text-black border border-gray-200 hover:bg-white transition-colors duration-200 font-light tracking-wide"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-black hover:bg-gray-900 text-white transition-colors duration-200 font-light tracking-wide"
                    >
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="bg-white border border-gray-100">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-light text-black">All Products ({products.length})</h2>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-300 text-8xl mb-8">📦</div>
              <h3 className="text-2xl font-light text-black mb-4">No products yet</h3>
              <p className="text-gray-600 text-lg">Start building your catalog by adding your first product</p>
            </div>
          ) : (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map(product => (
                  <div key={product.id} className="border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                    <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                      {product.imageUrl ? (
                        <img
                          src={getOptimizedImageUrl(product.imageUrl, 400, 300)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-light text-black mb-3 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                      <p className="text-2xl font-light text-black mb-6">
                        ₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(product.price)}
                      </p>
                      
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleEdit(product)}
                          className="flex-1 border border-gray-200 hover:bg-gray-50 text-black py-3 px-4 transition-colors duration-200 font-light tracking-wide"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="flex-1 border border-red-200 hover:bg-red-50 text-red-600 py-3 px-4 transition-colors duration-200 font-light tracking-wide"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;