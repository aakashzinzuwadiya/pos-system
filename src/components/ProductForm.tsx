import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface ProductFormProps {
  onSave: (product: Product) => void; // Use the same Product type, without the `id` since it's auto-generated
  editingProduct: Product | null;
}

const categories = ['Food', 'Beverages', 'Desserts']; // Centralized list of categories

const buttonBase = "p-2 rounded-md transition cursor-pointer font-semibold text-white";
const buttonHover = "hover:bg-indigo-700 bg-gradient-to-br from-indigo-500 to-purple-600";

const ProductForm: React.FC<ProductFormProps> = ({ onSave, editingProduct }) => {
  const [name, setName] = useState(editingProduct?.name || '');
  const [price, setPrice] = useState<string>(editingProduct ? editingProduct.price.toString() : ''); // Use a string for price to avoid showing 0 initially
  const [category, setCategory] = useState<'Food' | 'Beverages' | 'Desserts'>(editingProduct?.category || 'Food'); // Add category state

  // Update the form when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setName(name || editingProduct.name);
      setPrice(price || editingProduct.price.toString());
      setCategory(category || editingProduct.category);
    }
  }, [editingProduct]);

  // Handle form submission
  const handleSubmit = () => {
    // Ensure all fields are filled before submitting
    if (name.trim() === '' || price.trim() === '' || isNaN(Number(price))) {
      alert('Please fill all fields correctly.');
      return;
    }

    const productData = { id: editingProduct?.id || '', name, price: parseFloat(price), category }; // Include id, category, and quantity in the product data
    onSave(productData); // Pass product data to parent component

    // Reset the form if not in edit mode
    if (!editingProduct) {
      setName('');
      setPrice('');
      setCategory('Food');
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block text-gray-700">Product Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter product name"
          className="p-2 border border-gray-300 rounded w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Price ({process.env.REACT_APP_CURRENCY_SYMBOL})</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Enter product price"
          className="p-2 border border-gray-300 rounded w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as 'Food' | 'Beverages' | 'Desserts')}
          className={`p-2 border border-gray-300 rounded w-full`}
        >
          {categories.map((cat) => (
            <option
              key={cat}
              value={cat}
            >
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          type="submit"
          className={`${buttonBase} ${buttonHover}`}
        >
          {editingProduct ? 'Update' : 'Add'}
        </button>
      </div>
    </div>
  );
};

export default ProductForm;
