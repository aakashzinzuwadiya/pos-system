// src/components/ProductList.tsx
import React from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete }) => {
  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-4 h-full">
      <h2 className="text-xl font-medium mb-4 text-primary">Product List</h2>

      {/* Table Container with Fixed Height */}
      <div className="overflow-hidden h-[200px]">
        {/* Scroll only the table body */}
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-50 text-sm">
            <tr>
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Price</th>
              <th className="border px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>

          {/* Apply scroll only to table body */}
          <tbody className="overflow-y-auto block max-h-[150px]">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-100 transition-colors flex justify-between">
                <td className="border px-4 py-2 flex-1">{product.name}</td>
                <td className="border px-4 py-2 flex-1">
                  {currencySymbol}
                  {product.price}
                </td>
                <td className="border px-4 py-2 flex-1">
                  <button
                    className="bg-secondary text-white px-4 py-2 rounded-md mr-2 hover:bg-green-600 text-sm"
                    onClick={() => onEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-accent text-white px-4 py-2 rounded-md hover:bg-orange-600 text-sm"
                    onClick={() => onDelete(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
