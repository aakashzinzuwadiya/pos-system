// src/pages/PosPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import Cart from '../components/Cart';
import Modal from '../components/Modal';
import { getProducts, getTransactions, addTransaction } from '../firebaseService';
import { Timestamp } from 'firebase/firestore';
import { Product, CartItem, Transaction } from '../types';
import NavBar from 'components/NavBar';

const PosPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashReceived, setCashReceived] = useState(0);
  const [change, setChange] = useState(0);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [savedTransaction, setSavedTransaction] = useState<Transaction | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const printRef = useRef<HTMLDivElement | null>(null); // Reference for the print container
  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

  useEffect(() => {
    const fetchProducts = async () => {
      const productsList = await getProducts();
      setProducts(productsList);
    };

    const fetchTransactions = async () => {
      const transactionsList = await getTransactions();
      const sortedTransactions = transactionsList
      .filter((t) => !t.isDeleted)
      .sort((a, b) => b.date.toMillis() - a.date.toMillis());
      setTransactions(sortedTransactions);
    };

    fetchProducts();
    fetchTransactions();
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
    if (cart.length === 0) {
      alert('Cart is empty. Please add items to the cart before proceeding to payment.');
      return;
    }

    if (paymentMethod === 'Cash') {
      setShowCashModal(true);
      return;
    }

    await processTransaction(paymentMethod);
  };

  const processTransaction = async (paymentMethod: string) => {
    try {
      const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

      const transactionData: Omit<Transaction, 'id'> = {
        items: cart,
        totalAmount,
        date: Timestamp.now(),
        paymentMethod,
        isDeleted: false,
        change: paymentMethod === 'Cash' ? change : 0,
      };

      const transactionId = await addTransaction(transactionData);
      const savedTransactionData: Transaction = { ...transactionData, id: transactionId };
      setSavedTransaction(savedTransactionData);

      setCart([]);
      setCashReceived(0);
      setChange(0);
      setShowCashModal(false);
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  };

  const handleCashPayment = () => {
    const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const calculatedChange = cashReceived - totalAmount;

    if (calculatedChange < 0) {
      alert(`Insufficient cash. Total amount is ${currencySymbol}${totalAmount.toFixed(2)}, but received only ${currencySymbol}${cashReceived.toFixed(2)}.`);
      return;
    }

    setChange(calculatedChange);
    processTransaction('Cash');
  };

  const handleShowTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handlePrintTransaction = () => {
    if (selectedTransaction) {
      const printContent = printRef.current?.innerHTML;
      if (printContent) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Transaction Print</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                  }
                  .print-container {
                    border: 1px solid #000;
                    padding: 16px;
                    margin: 16px 0;
                  }
                  .print-header, .print-footer {
                    text-align: center;
                    font-size: 18px;
                    margin-bottom: 10px;
                  }
                  .print-items {
                    margin: 16px 0;
                  }
                </style>
              </head>
              <body>
                <div class="print-container">
                  ${printContent}
                </div>
                <script>
                  window.print();
                  window.onafterprint = window.close;
                </script>
              </body>
            </html>
          `);
        }
      }
    }
  };

  return (
    <>
      <NavBar />
      <div className="h-screen w-screen flex items-center justify-center overflow-hidden bg-gray-100 pb-5">
        <div className="bg-white border border-gray-300 rounded-lg shadow-xl w-full max-w-screen-2xl h-full flex flex-col md:flex-row">
          {/* Cart Section */}
          <div className="w-full md:w-3/5 p-2 h-full flex flex-col bg-white">
            {/* Cart Items Container */}
            <div className="flex-grow overflow-y-auto p-2 max-h-[83%]">
              <Cart
                cartItems={cart}
                onIncrease={handleIncreaseQuantity}
                onDecrease={handleDecreaseQuantity}
                onRemove={handleRemoveFromCart}
              />
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
            <div className="flex-grow grid grid-cols-2 p-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-[82%]">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  className="bg-blue-600 text-white p-4 rounded-lg shadow hover:bg-blue-700 transition duration-200 ease-in-out"
                >
                  <span className="block font-medium">{product.name}</span>
                  <span className="block mt-1">{currencySymbol}{product.price}</span>
                </button>
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
              <button onClick={() => handlePayment('Guest')} className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-yellow-600 transition">
                Guest
              </button>
              <button onClick={() => setCart([])} className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-red-600 transition">
                Delete
              </button>
              <button onClick={() => setShowTransactionsModal(true)} className="bg-gray-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-gray-700 transition">
                Show Transactions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Cash Payment Details */}
      <Modal isOpen={showCashModal} onClose={() => setShowCashModal(false)} title="Cash Payment Details">
        <div className="p-4">
          <label className="block text-lg font-semibold mb-2">Cash Received:</label>
          <input
            type="number"
            value={cashReceived}
            onChange={(e) => setCashReceived(parseFloat(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <button onClick={handleCashPayment} className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-green-600 transition">
            Confirm Payment
          </button>
        </div>
      </Modal>

      {/* Modal for Transaction List */}
      <Modal isOpen={showTransactionsModal} onClose={() => setShowTransactionsModal(false)} title="Transactions List">
        <div className="p-4 max-h-96 overflow-y-auto"> {/* Set the height and make the list scrollable */}
          <ul className="space-y-2">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="p-4 border rounded-lg shadow-sm flex justify-between items-center">
                <div>
                  <h4>Order ID: {transaction.orderId}</h4>
                  <p>Items Count: {transaction.items.length}</p>
                </div>
                <div className="space-x-4">
                  <button
                    onClick={() => handleShowTransaction(transaction)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition"
                  >
                    Show
                  </button>
                  <button
                    onClick={handlePrintTransaction}
                    className="px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 transition"
                  >
                    Print
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Modal>

      {/* Hidden div for printing */}
      <div ref={printRef} className="hidden">
        {selectedTransaction && (
          <div className="print-container">
            <h2 className="print-header">Order ID: {selectedTransaction.orderId}</h2>
            <ul className="print-items">
              {selectedTransaction.items.map((item) => (
                <li key={item.id}>
                  {item.name} - {item.quantity} pcs
                </li>
              ))}
            </ul>
            <div className="print-footer">
              Total Items: {selectedTransaction.items.reduce((acc, item) => acc + item.quantity, 0)}
              {selectedTransaction.paymentMethod === 'Cash' && (
                <div>
                  Change: {currencySymbol}{selectedTransaction.change?.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PosPage;
