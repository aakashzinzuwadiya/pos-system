// src/pages/PosPage.tsx
import React, { useState, useEffect } from 'react';
import Cart from '../components/Cart';
import Modal from '../components/Modal';
import { getProducts, addTransaction } from '../firebaseService';
import { Timestamp } from 'firebase/firestore';
import { Product, CartItem, Transaction } from '../types';

const PosPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedTransaction, setSavedTransaction] = useState<Transaction | null>(null);
  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

  useEffect(() => {
    const fetchProducts = async () => {
      const productsList = await getProducts();
      setProducts(productsList);
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      const updatedCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCart(updatedCart);
    } else {
      const newItem: CartItem = { ...product, quantity: 1 };
      setCart([...cart, newItem]);
    }
  };

  const handleIncreaseQuantity = (id: string) => {
    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCart(updatedCart);
  };

  const handleDecreaseQuantity = (id: string) => {
    const updatedCart = cart
      .map((item) => (item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item))
      .filter((item) => item.quantity > 0);
    setCart(updatedCart);
  };

  const handleRemoveFromCart = (id: string) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
  };

  const handlePayment = async (paymentMethod: string) => {
    try {
      const transactionData: Omit<Transaction, 'id'> = {
        items: cart,
        totalAmount: cart.reduce((total, item) => total + item.price * item.quantity, 0),
        date: Timestamp.now(),
        paymentMethod, // Pass the payment method
      };

      const transactionId = await addTransaction(transactionData);

      const savedTransactionData: Transaction = { ...transactionData, id: transactionId };
      setSavedTransaction(savedTransactionData);
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center p-4 overflow-hidden bg-gray-100 pb-5">
      <div className="bg-white border border-gray-300 rounded-lg shadow-xl w-full max-w-screen-2xl h-full flex flex-col md:flex-row">
        {/* Cart Section */}
        <div className="w-full md:w-3/5 p-2 h-full flex flex-col overflow-y-auto bg-white">
          {/* Reduced height for cart items container */}
          <div className="flex-grow overflow-y-auto p-2 max-h-[74vh]">
            <Cart
              cartItems={cart}
              onIncrease={handleIncreaseQuantity}
              onDecrease={handleDecreaseQuantity}
              onRemove={handleRemoveFromCart}
            />
          </div>

          {/* Total Section */}
          <div className="border-t border-gray-300 mt-4 pt-4 mb-2">
            <div className="flex justify-end items-center text-xl font-semibold text-gray-700">
              <span className="mr-4">Total: {' '}</span>
              <span className="mr-4 text-green-600">
                {currencySymbol}
                {cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Product List Section */}
        <div className="w-full md:w-2/5 p-2 h-full flex flex-col overflow-y-auto border-l border-gray-200">
          {/* Product List */}
          <div className="flex-grow grid grid-cols-2 p-2 sm:grid-cols-3 gap-4 mb-4 max-h-[70vh] overflow-hidden">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => handleAddToCart(product)}
                className="bg-blue-600 h-15 text-white p rounded-lg shadow hover:bg-blue-700 transition duration-200 ease-in-out"
              >
                <span className="block font-medium">{product.name}</span>
                <span className="block mt-1">{currencySymbol}{product.price}</span>
              </button>
            ))}
          </div>

          {/* Payment Options Buttons */}
          <div className="flex border-t border-gray-300 p-4 justify-between flex-wrap gap-2 mt-4">
            <button
              onClick={() => handlePayment('Card')}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition"
            >
              Card
            </button>
            <button
              onClick={() => handlePayment('Cash')}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-green-600 transition"
            >
              Cash
            </button>
            <button
              onClick={() => handlePayment('Guest')}
              className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-yellow-600 transition"
            >
              Guest
            </button>
            <button
              onClick={() => setCart([])}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-red-600 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Saved Transaction */}
      <Modal isOpen={!!savedTransaction} onClose={() => setSavedTransaction(null)} title="Transaction Details">
        {savedTransaction && (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Transaction ID: {savedTransaction.id}</h2>
            <ul className="space-y-2">
              {savedTransaction.items.map((item) => (
                <li key={item.id} className="border-b border-dashed py-2">
                  {item.name} - {item.quantity} x {currencySymbol}{item.price.toFixed(2)}
                </li>
              ))}
            </ul>
            <div className="mt-4 text-lg font-semibold">
              Total: {currencySymbol}{savedTransaction.totalAmount.toFixed(2)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PosPage;
