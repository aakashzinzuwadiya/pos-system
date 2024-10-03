// src/components/ProductForm.tsx
import React, { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface ProductFormProps {
  onSave: (product: Product) => void;
  editingProduct?: Product | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSave, editingProduct }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>(''); // Use number or empty string for controlled input

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setPrice(editingProduct.price);
    } else {
      setName('');
      setPrice('');
    }
  }, [editingProduct]);

  const handleSave = () => {
    if (name && price !== '') {
      const newProduct = {
        id: editingProduct ? editingProduct.id : Date.now(),
        name,
        price: Number(price), // Convert price to number
      };
      onSave(newProduct);
      setName('');
      setPrice('');
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div className="mb-4">
        <input
          type="number"
          placeholder="Product Price"
          value={price}
          onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} // Convert string to number or set to empty
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        {editingProduct ? 'Update Product' : 'Add Product'}
      </button>
    </div>
  );
};

export default ProductForm;
