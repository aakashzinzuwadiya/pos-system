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
  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));

  // Get the products to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  // Always show pagination controls, even for tablet views
  return (
    <div className="flex flex-col bg-white shadow-md p-4 border border-gray-300 rounded-lg w-full h-full">
      {/* Title and Add Product Button */}
      <div className="flex sm:flex-row flex-col justify-between items-center mb-4">
        <h2 className="mb-4 sm:mb-0 font-semibold text-primary text-lg">Product List</h2>
        <button
          onClick={onAddProduct}
          className="flex items-center hover:bg-indigo-700 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md px-4 py-2 rounded-md text-white transition"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Product
        </button>
      </div>

      {/* Headers Row */}
      <div className="hidden gap-4 md:grid grid-cols-5 bg-gray-100 p-2 border-gray-300 border-b font-semibold text-gray-700">
        <div>Product</div>
        <div>Category</div>
        <div className="text-center">Price ({currencySymbol})</div>
        <div className="col-span-2 text-center">Actions</div>
      </div>

      {/* Product Items List */}
      <div className="flex-grow mb-4 overflow-y-auto">
        {products.length === 0 ? (
          <p className="flex-grow text-center">No products available.</p>
        ) : (
          <ul className="space-y-2">
            {currentProducts.map((product) => (
              <li
                key={product.id}
                className="items-center gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 bg-gray-50 shadow-sm hover:shadow-md p-2 rounded-md transition duration-200"
              >
                {/* Product Name */}
                <div className="font-medium text-gray-800">{product.name}</div>
                {/* Product Category */}
                <div className="font-medium text-gray-600 md:text-center">{product.category}</div>
                {/* Product Price */}
                <div className="font-semibold text-blue-600 text-center">{`${currencySymbol}${product.price}`}</div>
                {/* Actions */}
                <div className="flex justify-center items-center space-x-2 col-span-1 md:col-span-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="hover:bg-indigo-700 bg-gradient-to-br from-indigo-500 to-purple-600 shadow px-3 py-2 rounded-md text-white transition"
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="hover:bg-red-700 bg-gradient-to-br from-red-500 to-red-700 shadow px-3 py-2 rounded-md text-white transition"
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
      <div className="flex sm:flex-row flex-col justify-between items-center gap-2 mt-4">
        <div className="text-gray-700 text-sm">
          {`Showing ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, products.length)} of ${products.length} products`}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="hover:bg-indigo-700 bg-gradient-to-br from-indigo-500 to-purple-600 disabled:opacity-50 shadow-md px-4 py-2 rounded-md text-white transition duration-150 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="py-2 font-semibold text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="hover:bg-indigo-700 bg-gradient-to-br from-indigo-500 to-purple-600 disabled:opacity-50 shadow-md px-4 py-2 rounded-md text-white transition duration-150 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
