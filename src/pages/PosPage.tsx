import React, { useEffect, useState } from 'react';
import Cart from '../components/Cart';
import Modal from '../components/Modal';
import NavBar from 'components/NavBar';
import Loading from '../components/Loading'; // Import Loading component
import { usePos } from 'context/PosContext';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import { Product } from 'types';

import './PosPage.css';
import TransactionDetailsModal from 'components/TransactionDetailsModal';

const PosPage: React.FC = () => {
  const {
    products,
    fetchProducts,
    cart,
    addToCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    handleCashPayment,
    handleCardPayment,
    savedTransaction,
  } = usePos();

  const [cashReceived, setCashReceived] = useState(0);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const [activeCategory, setActiveCategory] = useState('All'); // State to track selected category

  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

  // Color mapping for different categories
  const categoryColors: { [key: string]: string } = {
    Beverages: 'bg-indigo-600',       // Indigo for a rich, calm tone
    Food: 'bg-teal-500',            // Teal for a refreshing, modern look
    Desserts: 'bg-rose-600',
    Uncategorized: 'bg-gray-500',
    // Add more categories and their respective colors
    All: 'bg-gray-300', // Default color for the "All" category
  };

  const handlePayment = async (paymentMethod: string) => {
    if (cart.length === 0) {
      toast.error('Cart is empty. Please add items to the cart before proceeding to payment.');
      return;
    }

    setLoading(true);
    try {
      if (paymentMethod === 'Cash') {
        setShowCashModal(true);
      } else if (paymentMethod === 'Card' || paymentMethod === 'Guest') {
        await handleCardPayment(paymentMethod);
        setShowTransactionModal(true);
      }
    } catch (error) {
      toast.error('Failed to process payment. Please try again.');
    }
    setLoading(false);
  };

  const handleCashTransaction = async () => {
    setLoading(true);
    await handleCashPayment(cashReceived);
    setShowCashModal(false);
    setShowTransactionModal(true);
    setLoading(false);
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Cart cleared successfully!');
  };

  const resetStates = () => {
    setCashReceived(0);
    setShowTransactionModal(false);
  };

  const groupedProducts = products.reduce<{ [key: string]: Product[] }>((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {});

  const categories = ['All', ...Object.keys(groupedProducts)];

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      <ToastContainer />
      {loading && <Loading />}

      <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-100">
        {/* Navigation */}
        <NavBar />

        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          {/* Cart Section */}
          <div className="w-full md:w-2/5 p-2 h-full flex flex-col bg-white">
            {/* Cart Items Container */}
            <div className="flex-grow overflow-y-auto p-2">
              <Cart cartItems={cart} onIncrease={increaseQuantity} onDecrease={decreaseQuantity} onRemove={removeFromCart} />
            </div>

            <div className="border-t border-gray-300 p-4 flex justify-between items-center text-sm font-semibold text-gray-700">
              <button
                onClick={handleClearCart}
                className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600 transition duration-150 ease-in-out">
                Clear Cart
              </button>

              <div className="flex items-center">
                <span className="mr-4">Total:</span>
                <span className="text-green-600">
                  {currencySymbol}
                  {cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Product List Section */}
          <div className="w-full md:w-3/5 p-2 h-full flex flex-col border-l border-gray-200">
            {/* Category Tabs */}
            <div className="flex border-b border-gray-300 mb-4 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 text-sm font-semibold text-gray-600 ${activeCategory === category ? 'text-blue-500 border-b-2 border-blue-500' : 'hover:text-blue-400'}`}>
                  {category}
                </button>
              ))}
            </div>

            {/* Product List with Scrolling */}
            <div className="flex-grow p-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto auto-rows-min">
              {(activeCategory === 'All' ? products : groupedProducts[activeCategory] || []).map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`${categoryColors[product.category] || 'bg-gray-500'} text-white p-3 rounded-md shadow-sm hover:bg-opacity-80 transition duration-200 ease-in-out flex items-center justify-center text-center text-sm`}>
                  <div className="flex flex-col items-center justify-center">
                    <span className="font-medium truncate">{product.name}</span>
                    <span className="mt-1 text-sm text-yellow-200">
                      {currencySymbol}
                      {product.price.toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Payment Options - Stick to Bottom in Mobile View */}
            <div className="flex border-t border-gray-300 p-4 justify-between gap-2 md:relative md:mt-auto fixed bottom-0 left-0 right-0 bg-white md:bg-transparent">
              <button onClick={() => handlePayment('Card')} className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition">
                Card
              </button>
              <button onClick={() => handlePayment('Cash')} className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-green-600 transition">
                Cash
              </button>
              <button onClick={() => handlePayment('Guest')} className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition">
                Guest
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Cash Payment Details */}
      <Modal isOpen={showCashModal} onClose={() => setShowCashModal(false)} title="Cash Payment Details" buttonLabel={'Confirm Payment'} handleButton={handleCashTransaction}>
        <div className="p-4">
          <label className="block text-lg font-semibold mb-2">Total Amount: {currencySymbol}{cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</label>
          <label className="block text-lg font-semibold mb-2">Cash Received:</label>
          <input type="number" value={cashReceived} onChange={(e) => setCashReceived(parseFloat(e.target.value))} className="w-full p-2 border border-gray-300 rounded-md" />
          <div className="mt-4 text-lg font-semibold">Change: {currencySymbol}{(cashReceived - cart.reduce((total, item) => total + item.price * item.quantity, 0)).toFixed(2)}</div>
        </div>
      </Modal>

      {/* Modal for Transaction Details After Payment */}
      <TransactionDetailsModal transaction={savedTransaction} isOpen={showTransactionModal} onClose={() => resetStates()} />
    </>
  );
};

export default PosPage;
