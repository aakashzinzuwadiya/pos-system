import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface ProductFormProps {
  onSave: (product: Omit<Product, 'id'>) => void; // Use the same Product type, without the `id` since it's auto-generated
  editingProduct: Product | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSave, editingProduct }) => {
  const [name, setName] = useState(editingProduct?.name || '');
  const [price, setPrice] = useState(editingProduct?.price || 0);
  const [category, setCategory] = useState<'Food' | 'Beverages'>(editingProduct?.category || 'Food'); // Add category state

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setPrice(editingProduct.price);
      setCategory(editingProduct.category); // Set the category if editing
    }
  }, [editingProduct]);

  const handleSubmit = () => {
    const productData = { name, price, category }; // Include category in the product data
    onSave(productData); // Pass product data to parent component
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block text-gray-700">Product Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Price ({process.env.REACT_APP_CURRENCY_SYMBOL})</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as 'Food' | 'Beverages')}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="Food">Food</option>
          <option value="Beverages">Beverages</option>
        </select>
      </div>
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        {editingProduct ? 'Update Product' : 'Add Product'}
      </button>
    </div>
  );
};

export default ProductForm;
