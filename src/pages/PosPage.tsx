import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cart from '../components/Cart';
import Modal from '../components/Modal';
import NavBar from 'components/NavBar';
import Loading from '../components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartItem, Product } from 'types';
import './PosPage.css';
import TransactionDetailsModal from 'components/TransactionDetailsModal';
import { getProducts } from 'services/mysqlService';

const PosPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cashReceived, setCashReceived] = useState(0);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [savedTransaction, setSavedTransaction] = useState<any>(null);

  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

  const categoryColors: { [key: string]: string } = {
    Beverages: 'bg-indigo-600',
    Food: 'bg-teal-500',
    Desserts: 'bg-rose-600',
    Uncategorized: 'bg-gray-500',
    All: 'bg-gray-300',
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts();
      setProducts(response as Product[]);
    } catch (error) {
      toast.error('Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared successfully!');
  };

  const increaseQuantity = (productId: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (productId: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
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
      } else {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/payment`, {
          paymentMethod,
          cart,
          email: 'admin@gmail.com',
        });
        setSavedTransaction(response.data);
        setShowTransactionModal(true);
      }
    } catch (error) {
      toast.error('Failed to process payment. Please try again.');
    }
    setLoading(false);
  };

  const handleCashTransaction = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/payment`, {
        paymentMethod: 'Cash',
        cart,
        cashReceived,
        email: 'admin@gmail.com',
      });
      setSavedTransaction(response.data);
      setShowCashModal(false);
      setShowTransactionModal(true);
    } catch (error) {
      toast.error('Failed to process cash payment. Please try again.');
    }
    setLoading(false);
  };

  const resetStates = () => {
    setCashReceived(0);
    setShowTransactionModal(false);
    setCart([]);
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

      <div className="flex flex-col bg-gray-100 w-screen h-screen overflow-hidden">
        <NavBar />

        <div className="flex md:flex-row flex-col flex-grow overflow-hidden">
          <div className="flex flex-col bg-white p-2 w-full md:w-2/5 h-full">
            <div className="flex-grow p-2 overflow-y-auto">
              <Cart cartItems={cart} onIncrease={increaseQuantity} onDecrease={decreaseQuantity} onRemove={removeFromCart} />
            </div>

            <div className="flex justify-between items-center p-4 border-gray-300 border-t font-semibold text-gray-700 text-sm">
              <button
                onClick={clearCart}
                className="bg-red-500 hover:bg-red-600 shadow-md px-4 py-2 rounded-md text-white transition duration-150 ease-in-out">
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

          <div className="flex flex-col p-2 border-gray-200 border-l w-full md:w-3/5 h-full">
            <div className="flex mb-4 border-gray-300 border-b overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 text-sm font-semibold text-gray-600 ${activeCategory === category ? 'text-blue-500 border-b-2 border-blue-500' : 'hover:text-blue-400'}`}>
                  {category}
                </button>
              ))}
            </div>

            <div className="flex-grow gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-min p-2 overflow-y-auto">
              {(activeCategory === 'All' ? products : groupedProducts[activeCategory] || []).map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`${categoryColors[product.category] || 'bg-gray-500'} text-white p-3 rounded-md shadow-sm hover:bg-opacity-80 transition duration-200 ease-in-out flex items-center justify-center text-center text-sm`}>
                  <div className="flex flex-col justify-center items-center">
                    <span className="font-medium truncate">{product.name}</span>
                    <span className="mt-1 text-yellow-200 text-sm">
                      {currencySymbol}
                      {product.price}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="right-0 bottom-0 left-0 fixed md:relative flex justify-between gap-2 bg-white md:bg-transparent md:mt-auto p-4 border-gray-300 border-t">
              <button onClick={() => handlePayment('Card')} className="flex-1 bg-blue-500 hover:bg-blue-600 shadow-md px-4 py-2 rounded-md text-white transition">
                Card
              </button>
              <button onClick={() => handlePayment('Cash')} className="flex-1 bg-green-500 hover:bg-green-600 shadow-md px-4 py-2 rounded-md text-white transition">
                Cash
              </button>
              <button onClick={() => handlePayment('Guest')} className="flex-1 bg-yellow-500 hover:bg-blue-600 shadow-md px-4 py-2 rounded-md text-white transition">
                Guest
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showCashModal} onClose={() => setShowCashModal(false)} title="Cash Payment Details" buttonLabel={'Confirm Payment'} handleButton={handleCashTransaction}
        showButton={cashReceived >= cart.reduce((total, item) => total + item.price * item.quantity, 0)}>
        <div className="p-4">
          <label className="block mb-2 font-semibold text-lg">Total Amount: {currencySymbol}{cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</label>
          <label className="block mb-2 font-semibold text-lg">Cash Received:</label>
          <input
            type="number"
            value={cashReceived === 0 ? '' : cashReceived}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d{0,2}$/.test(value)) {
                setCashReceived(value === '' ? 0 : parseFloat(value));
              }
            }}
            className="p-2 border border-gray-300 rounded-md w-full"
          />
          <div className="mt-4 font-semibold text-lg">Change: {currencySymbol}{(cashReceived > 0 && (cashReceived - cart.reduce((total, item) => total + item.price * item.quantity, 0)).toFixed(2)) || 0}</div>
            {cashReceived > 0 && cashReceived < cart.reduce((total, item) => total + item.price * item.quantity, 0) && (
            <div><span style={{ color: 'red' }}>Please enter a valid Cash Received amount.</span></div>
            )}
        </div>
      </Modal>

      <TransactionDetailsModal transaction={savedTransaction} isOpen={showTransactionModal} onClose={() => resetStates()} />
    </>
  );
};

export default PosPage;