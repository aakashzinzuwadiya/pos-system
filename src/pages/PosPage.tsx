import React, { useEffect, useState } from 'react';
import Cart from '../components/Cart';
import Modal from '../components/Modal';
import NavBar from 'components/NavBar';
import Loading from '../components/Loading'; // Import Loading component
import { usePos } from 'context/PosContext';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import { Product } from 'types';

const PosPage: React.FC = () => {
  const {
    products,
    fetchProducts,
    cart,
    change,
    addToCart,
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
  const [showChangeInModal, setShowChangeInModal] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

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
      toast.error('Failed to process payment. Please try again.'); // Show error message
    }
    setLoading(false);
  };

  // Handle cash transactions
  const handleCashTransaction = async () => {
    setLoading(true); // Set loading to true when operation starts
    await handleCashPayment(cashReceived);
    setShowCashModal(false);
    setShowTransactionModal(true); // Show transaction modal after cash payment
    setShowChangeInModal(true); // Set this to true to show the change in the modal
    setLoading(false); // Set loading to false when operation ends
  };

  // Handle printing
  const handlePrint = () => {
    setShowChangeInModal(false); // Hide the change when printing
    setTimeout(() => window.print(), 100); // Print after a short delay to allow state to update
  };

  // Reset states after transactions
  const resetStates = () => {
    setCashReceived(0);
    setShowTransactionModal(false);
    setShowChangeInModal(false);
  };

  // Group products by category
  const groupedProducts = products.reduce<{ [key: string]: Product[] }>((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {});

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      <NavBar />

      <ToastContainer />
      {/* Show Loading Indicator if loading is true */}
      {loading && <Loading />}

      <div className="h-screen w-screen flex items-center justify-center overflow-hidden bg-gray-100 pb-5">
        <div className="bg-white border border-gray-300 rounded-lg shadow-xl w-full max-w-screen-2xl h-full flex flex-col md:flex-row">
          {/* Cart Section */}
          <div className="w-full md:w-3/5 p-2 h-full flex flex-col bg-white">
            {/* Cart Items Container */}
            <div className="flex-grow overflow-y-auto p-2 max-h-[83%]">
              <Cart cartItems={cart} onIncrease={increaseQuantity} onDecrease={decreaseQuantity} onRemove={removeFromCart} />
            </div>
            {/* Total Section */}
            <div className="border-t border-gray-300 p-4 flex justify-end items-center text-xl font-semibold text-gray-700 pb-4">
              <span className="mr-4">Total: </span>
              <span className="text-green-600">{currencySymbol}{cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Product List Section */}
          <div className="w-full md:w-2/5 p-2 h-full flex flex-col border-l border-gray-200">
            {/* Product List */}
            <div className="flex-grow p-2 sm:grid-cols-3 gap-4 overflow-y-hidden max-h-[83%]">
              {/* {products.map((product) => (
                <button key={product.id} onClick={() => addToCart(product)} className="bg-blue-600 text-white p-4 rounded-lg shadow hover:bg-blue-700 transition duration-200 ease-in-out">
                  <span className="block font-medium">{product.name}</span>
                  <span className="block mt-1">{currencySymbol}{product.price.toFixed(2)}</span>
                </button>
              ))} */}
              {Object.keys(groupedProducts).map((category) => (
                <div key={category} className="mb-2 pb-2"> {/* Added border for visual separation */}
                  {/* Category Header */}
                  <h5 className="text-lg font-semibold text-gray-700 mb-2 pl-2 border-l-4 border-blue-500">{category}</h5>

                  {/* Product Buttons in a Horizontal Row with Wrapping */}
                  <div className="flex flex-wrap gap-3">
                    {groupedProducts[category].map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="bg-blue-500 text-white p-3 rounded-md shadow-sm hover:bg-blue-600 transition duration-200 ease-in-out w-[25%] min-w-[180px] h-[70px] flex items-center justify-center text-center text-sm" // Uniform size and text adjustments
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span className="font-medium truncate">{product.name}</span> {/* `truncate` ensures text doesn't overflow */}
                          <span className="mt-1 text-sm text-yellow-200">
                            {currencySymbol}
                            {product.price.toFixed(2)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}


            </div>

            {/* Payment Options Buttons */}
            <div className="flex border-t border-gray-300 p-4 justify-between gap-2 mt-2">
              <button onClick={() => handlePayment('Card')} className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition">
                Card
              </button>
              <button onClick={() => handlePayment('Cash')} className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-green-600 transition">
                Cash
              </button>
              <button onClick={() => handlePayment('Guest')} className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition">
                Guest
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Cash Payment Details */}
      <Modal isOpen={showCashModal} onClose={() => setShowCashModal(false)} title="Cash Payment Details">
        <div className="p-4">
          <label className="block text-lg font-semibold mb-2">Total Amount: {currencySymbol}{cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</label>
          <label className="block text-lg font-semibold mb-2">Cash Received:</label>
          <input type="number" value={cashReceived} onChange={(e) => setCashReceived(parseFloat(e.target.value))} className="w-full p-2 border border-gray-300 rounded-md" />
          <div className="mt-4 text-lg font-semibold">Change: {currencySymbol}{(cashReceived - cart.reduce((total, item) => total + item.price * item.quantity, 0)).toFixed(2)}</div>
          <button onClick={handleCashTransaction} className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-green-600 transition">
            Confirm Payment
          </button>
        </div>
      </Modal>

      {/* Modal for Transaction Details After Payment */}
      <Modal isOpen={showTransactionModal} onClose={resetStates} title={savedTransaction?.orderId || "Order Details"}>
        {savedTransaction && (
          <div className="p-4">
            {/* Date and Time on Top Right */}
            <div className="text-sm font-semibold mb-2 flex justify-end w-full">
              {/* Date aligned to the right */}
              <span className="text-right">
                {savedTransaction && new Date(savedTransaction.date.toMillis()).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'medium' })}
              </span>
            </div>

            {/* Transaction Items List */}
            <ul className="space-y-2">
              {savedTransaction.items.map((item) => (
                <li key={item.id} className="border-b border-dashed py-2 flex justify-between text-lg font-bold text-gray-800">
                  <span>{item.name}</span>
                  <span>{item.quantity}</span>
                </li>
              ))}
            </ul>

            {/* Print Button */}
            <div className="mt-4 flex justify-center">
              <button onClick={handlePrint} className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition">
                Print
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default PosPage;
