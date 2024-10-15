import React, { useState } from 'react';
import { Product } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

import './ProductList.css';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAddProduct: () => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete, onAddProduct }) => {
  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '£';
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Calculate the total number of pages
  const totalPages = Math.ceil(products.length / itemsPerPage);

  // Get the transactions to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="w-full h-full p-4 bg-white border border-gray-300 rounded-lg shadow-md flex flex-col">
      {/* Title and Add Product Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-primary mb-4 sm:mb-0">Product List</h2>
        <button
          onClick={onAddProduct}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 transition"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Product
        </button>
      </div>

      {/* Headers Row */}
      <div className="hidden md:grid grid-cols-5 gap-4 p-2 font-semibold text-gray-700 bg-gray-100 border-b border-gray-300">
        <div>Product</div>
        <div>Category</div>
        <div className="text-center">Price ({currencySymbol})</div>
        <div className="text-center col-span-2">Actions</div>
      </div>

      {/* Product Items List */}
      <div className="flex-grow overflow-y-auto mb-4">
        {products.length === 0 ? (
          <p className="text-center flex-grow">No products available.</p>
        ) : (
          <ul className="space-y-2">
            {currentProducts.map((product) => (
              <li
                key={product.id}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-center bg-gray-50 p-4 rounded-md shadow-sm hover:shadow-md transition duration-200"
              >
                {/* Product Name */}
                <div className="font-medium text-gray-800">{product.name}</div>

                {/* Product Category */}
                <div className="font-medium text-gray-600 md:text-center">{product.category}</div>

                {/* Product Price */}
                <div className="text-center text-gray-800">{`${currencySymbol}${product.price.toFixed(2)}`}</div>

                {/* Actions */}
                <div className="flex justify-center items-center space-x-2 col-span-1 md:col-span-2">
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

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-4 space-x-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md shadow-md hover:bg-gray-400 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="font-semibold text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md shadow-md hover:bg-gray-400 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductList;
