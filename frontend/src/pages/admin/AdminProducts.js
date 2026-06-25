import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_available: true,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      const data = response.data;
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const data = response.data;
      setCategories(Array.isArray(data) ? data : data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
        is_available: formData.is_available ? 1 : 0,
      };
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productData);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', productData);
        toast.success('Product created successfully');
      }
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save product';
      toast.error(message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category_id: product.category_id?.toString() || '',
      is_available: product.is_available === 1,
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete product';
        toast.error(message);
      }
    }
  };

  const toggleAvailability = async (product) => {
    try {
      await api.put(`/products/${product.id}`, {
        is_available: product.is_available === 1 ? 0 : 1,
      });
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      is_available: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-secondary-900">Products</h2>
        <button
          onClick={() => { resetForm(); setEditingProduct(null); setShowModal(true); }}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <FiPlus />
          <span>Add Product</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
              <div className="h-4 bg-secondary-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Available</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {products.map((product) => {
                  const cat = categories.find(c => c.id === product.category_id);
                  return (
                    <tr key={product.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                        {cat?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">${product.price?.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleAvailability(product)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            product.is_available === 1
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.is_available === 1 ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-primary-500 hover:text-primary-600"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative z-10">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
                <button onClick={() => setShowModal(false)} className="text-secondary-400 hover:text-secondary-600">
                  <FiX className="text-xl" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="text-primary-500 focus:ring-primary-500 rounded"
                  />
                  <label htmlFor="is_available" className="ml-2 text-sm text-secondary-700">Available</label>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {editingProduct ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
