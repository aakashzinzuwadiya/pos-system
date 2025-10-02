// src/components/Cart.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import './Cart.css';

interface CartItem {
  id: string; // Change from `number` to `string`
  name: string;
  price: number;
  quantity: number;
}

// interface CartProps {
//   cartItems: CartItem[];
//   onIncrease: (id: string) => void; // Update `id` to `string`
//   onDecrease: (id: string) => void; // Update `id` to `string`
//   onRemove: (id: string) => void;   // Update `id` to `string`
// }

interface CartProps {
  cartItems: CartItem[];
  onIncrease: (id: string) => void; // Update `id` to `string`
  onDecrease: (id: string) => void; // Update `id` to `string`
  onRemove: (id: string) => void;   // Update `id` to `string`
}

const Cart: React.FC<CartProps> = ({ cartItems, onIncrease, onDecrease, onRemove }) => {
  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

  return (
    <div className="flex flex-col bg-white shadow-md border border-gray-300 rounded-lg w-full h-full">
      {/* Headers Row */}
      <div className="gap-4 grid grid-cols-6 bg-gray-100 p-2 border-gray-300 border-b font-semibold text-gray-700">
        <div className="col-span-2">Item</div>
        <div className="text-center">Quantity</div>
        <div className="text-center">Price</div>
        <div className="text-center">Total Price</div>
        <div className="text-center">Actions</div>
      </div>

      {/* Cart Items List - Scrollable Section */}
      <div className="flex-grow p-4 overflow-y-auto">
        {cartItems.length === 0 ? (
          <p className="text-gray-600 text-center">Your cart is empty.</p>
        ) : (
          <ul className="space-y-2">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="items-center gap-4 grid grid-cols-6 bg-gray-50 shadow-sm p-2 rounded-md"
              >
                {/* Item Name */}
                <div className="col-span-2">
                  <h3 className="font-medium text-gray-800">{item.name}</h3>
                </div>

                {/* Quantity */}
                <div className="text-gray-600 text-center">
                  {item.quantity}
                </div>

                {/* Price */}
                <div className="text-gray-800 text-center">
                  {currencySymbol}{item.price}
                </div>

                {/* Total Price (Quantity x Price) */}
                <div className="font-semibold text-gray-800 text-center">
                  {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                </div>

                {/* Actions */}
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => onIncrease(item.id)}
                    className="bg-green-500 hover:bg-green-600 shadow px-2 py-1 rounded-md text-white transition"
                  >
                    +
                  </button>
                  <button
                    onClick={() => onDecrease(item.id)}
                    className="bg-red-500 hover:bg-red-600 shadow px-2 py-1 rounded-md text-white transition"
                  >
                    -
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="bg-gray-500 hover:bg-gray-600 shadow px-2 py-1 rounded-md text-white transition"
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

export default Cart;
