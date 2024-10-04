// src/components/ProductList.tsx
import React from 'react';
import { Product } from '../types'; // Import the correct Product type from types file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void; // `id` should be a string type to match Firestore's ID type
  onAddProduct: () => void; // Callback function to open Add Product modal
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete, onAddProduct }) => {
  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL;

  return (
    <div className="w-full h-full p-4 bg-white border border-gray-300 rounded-lg shadow-md flex flex-col">
      {/* Title and Add Product Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-primary">Product List</h2>
        {/* Right-Aligned Add Product Button */}
        <button
          onClick={onAddProduct}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 transition"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Product
        </button>
      </div>

      {/* Headers Row */}
      <div className="grid grid-cols-4 gap-4 p-2 font-semibold text-gray-700 bg-gray-100 border-b border-gray-300">
        <div>Product</div>
        <div className="text-center">Price</div>
        <div className="text-center col-span-2">Actions</div>
      </div>

      {/* Product Items List */}
      <div className="flex-grow overflow-y-auto mb-4">
        {products.length === 0 ? (
          <p className="text-center flex-grow">No products available.</p>
        ) : (
          <ul className="space-y-2">
            {products.map((product) => (
              <li
                key={product.id}
                className="grid grid-cols-4 gap-4 items-center bg-gray-50 p-2 rounded-md shadow-sm"
              >
                {/* Product Name */}
                <div className="font-medium text-gray-800">{product.name}</div>

                {/* Product Price */}
                <div className="text-center text-gray-800">{`${currencySymbol}${product.price.toFixed(2)}`}</div>

                {/* Actions */}
                <div className="flex justify-center items-center space-x-2 col-span-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition"
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProductList;
