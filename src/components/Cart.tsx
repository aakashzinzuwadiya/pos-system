// src/components/Cart.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

interface CartItem {
  id: string; // Change from `number` to `string`
  name: string;
  price: number;
  quantity: number;
}

interface CartProps {
  cartItems: CartItem[];
  onIncrease: (id: string) => void; // Update `id` to `string`
  onDecrease: (id: string) => void; // Update `id` to `string`
  onRemove: (id: string) => void;   // Update `id` to `string`
}

const Cart: React.FC<CartProps> = ({ cartItems, onIncrease, onDecrease, onRemove }) => {
  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

  return (
    <div className="w-full h-full flex flex-col border border-gray-300 rounded-lg shadow-md bg-white">
      {/* Headers Row */}
      <div className="grid grid-cols-6 gap-4 p-2 font-semibold text-gray-700 bg-gray-100 border-b border-gray-300">
        <div className="col-span-2">Item</div>
        <div className="text-center">Quantity</div>
        <div className="text-center">Price</div>
        <div className="text-center">Total Price</div>
        <div className="text-center">Actions</div>
      </div>

      {/* Cart Items List - Scrollable Section */}
      <div className="flex-grow overflow-y-auto p-4">
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-600">Your cart is empty.</p>
        ) : (
          <ul className="space-y-2">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-6 gap-4 items-center bg-gray-50 p-2 rounded-md shadow-sm"
              >
                {/* Item Name */}
                <div className="col-span-2">
                  <h3 className="font-medium text-gray-800">{item.name}</h3>
                </div>

                {/* Quantity */}
                <div className="text-center text-gray-600">
                  {item.quantity}
                </div>

                {/* Price */}
                <div className="text-center text-gray-800">
                  {currencySymbol}{item.price.toFixed(2)}
                </div>

                {/* Total Price (Quantity x Price) */}
                <div className="text-center text-gray-800 font-semibold">
                  {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                </div>

                {/* Actions */}
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => onIncrease(item.id)}
                    className="px-2 py-1 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition"
                  >
                    +
                  </button>
                  <button
                    onClick={() => onDecrease(item.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition"
                  >
                    -
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="px-2 py-1 bg-gray-500 text-white rounded-md shadow hover:bg-gray-600 transition"
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
