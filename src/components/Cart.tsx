// src/components/Cart.tsx
import React from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartProps {
  cartItems: CartItem[];
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
}

const Cart: React.FC<CartProps> = ({ cartItems, onIncrease, onDecrease }) => {
  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 h-full">
      <h2 className="text-xl font-medium mb-4 text-primary">Cart</h2>

      {/* Table Container with Fixed Height */}
      <div className="relative overflow-hidden h-[300px]">
        {/* Create a separate header section */}
        <table className="w-full table-fixed border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-4 py-2 text-left w-1/5">Item</th>
              <th className="border px-4 py-2 text-left w-1/5">Price</th>
              <th className="border px-4 py-2 text-left w-1/5">Quantity</th>
              <th className="border px-4 py-2 text-left w-1/5">Total</th>
              <th className="border px-4 py-2 text-left w-1/5">Actions</th>
            </tr>
          </thead>
        </table>

        {/* Scrollable table body */}
        <div className="overflow-y-auto h-[250px]">
          <table className="w-full table-fixed border-collapse">
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-100 transition-colors">
                  <td className="border px-4 py-2 w-1/5">{item.name}</td>
                  <td className="border px-4 py-2 w-1/5">
                    {currencySymbol}
                    {item.price}
                  </td>
                  <td className="border px-4 py-2 w-1/5">{item.quantity}</td>
                  <td className="border px-4 py-2 w-1/5">
                    {currencySymbol}
                    {item.price * item.quantity}
                  </td>
                  <td className="border px-4 py-2 w-1/5">
                    <button
                      className="bg-secondary text-white px-3 py-1 rounded-md hover:bg-green-600 text-sm"
                      onClick={() => onIncrease(item.id)}
                    >
                      +
                    </button>
                    <button
                      className="bg-secondary text-white px-3 py-1 rounded-md ml-2 hover:bg-green-600 text-sm"
                      onClick={() => onDecrease(item.id)}
                    >
                      -
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Amount Display */}
      <div className="text-right font-bold text-base mt-4 text-primary">
        Total: {currencySymbol}
        {total.toFixed(2)}
      </div>
    </div>
  );
};

export default Cart;
