// src/components/ProductForm.tsx
import React, { useState, useEffect } from 'react';
import { Product } from '../types'; // Ensure you're importing from `src/types`

interface ProductFormProps {
  onSave: (product: Omit<Product, 'id'>) => void; // Use the same Product type, without the `id` since it's auto-generated
  editingProduct: Product | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSave, editingProduct }) => {
  const [name, setName] = useState(editingProduct?.name || '');
  const [price, setPrice] = useState(editingProduct?.price || 0);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setPrice(editingProduct.price);
    }
  }, [editingProduct]);

  const handleSubmit = () => {
    const productData = { name, price };
    onSave(productData); // Pass product data to parent
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
        <label className="block text-gray-700">Price({process.env.REACT_APP_CURRENCY_SYMBOL})</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">
        {editingProduct ? 'Update Product' : 'Add Product'}
      </button>
    </div>
  );
};

export default ProductForm;
