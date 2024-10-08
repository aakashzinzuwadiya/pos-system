// src/contexts/PosContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Product, CartItem, Transaction, ProductAnalyticsType } from '../types';
import { getProducts, getTransactions, addTransaction, deleteTransaction } from '../firebaseService';
import { Timestamp } from 'firebase/firestore';

// Define context properties
interface PosContextProps {
  products: Product[];
  fetchProducts: () => void;
  cart: CartItem[];
  transactions: Transaction[];
  change: number;
  savedTransaction: Transaction | null; // Add savedTransaction to context
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (product: Product) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;
  handleCashPayment: (cashReceived: number) => void;
  fetchTransactions: () => void;
  handleCardPayment: (paymentMethod: string) => void;
  handleDeleteTransaction: (id: string) => Promise<void>;
  getProductAnalytics: () => ProductAnalyticsType[];
}

// Create context
const PosContext = createContext<PosContextProps | undefined>(undefined);

// Context Provider Component
export const PosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [change, setChange] = useState(0);
  const [savedTransaction, setSavedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchTransactions();
  }, []);

  // Fetch products from the backend or Firebase
  const fetchProducts = async () => {
    try {
      const productsList = await getProducts();
      setProducts(productsList);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchTransactions = async () => {
    const transactionsList = await getTransactions();
    const sortedTransactions = transactionsList.filter((t) => !t.isDeleted).sort((a, b) => b.date.toMillis() - a.date.toMillis());
    setTransactions(sortedTransactions);
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      const updatedCart = cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      setCart(updatedCart);
    } else {
      const newItem: CartItem = { ...product, quantity: 1 };
      setCart([...cart, newItem]);
    }
  };

  const increaseQuantity = (id: string) => {
    const updatedCart = cart.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
    setCart(updatedCart);
  };

  const decreaseQuantity = (id: string) => {
    const updatedCart = cart
      .map((item) => (item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item))
      .filter((item) => item.quantity > 0);
    setCart(updatedCart);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const generateOrderId = (): string => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0'); // Get day and pad with leading 0 if needed
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Get month (0-indexed, so add 1) and pad with leading 0
    const year = String(now.getFullYear()).slice(-2); // Get last 2 digits of the year
    const hour = String(now.getHours()).padStart(2, '0'); // Get hour and pad with leading 0 if needed
    const minute = String(now.getMinutes()).padStart(2, '0'); // Get minute and pad with leading 0
    const second = String(now.getSeconds()).padStart(2, '0'); // Get second and pad with leading 0

    return `${day}${month}${year}${hour}${minute}${second}`;
  };

  const handleCashPayment = async (cashReceived: number) => {
    const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    if (cashReceived < totalAmount) {
      alert(`Insufficient cash. Total amount is ${totalAmount.toFixed(2)}, but received only ${cashReceived.toFixed(2)}.`);
      return;
    }
    setChange(cashReceived - totalAmount);

    try {
      const transactionData: Omit<Transaction, 'id'> = {
        items: cart,
        totalAmount,
        date: Timestamp.now(),
        paymentMethod: 'Cash',
        isDeleted: false,
        change: cashReceived - totalAmount,
        orderId: generateOrderId(), //
      };
      const transactionId = await addTransaction(transactionData);
      const newTransaction: Transaction = { ...transactionData, id: transactionId }; // Create full Transact
      console.log('newTransac', newTransaction);
      setSavedTransaction(newTransaction);
      setCart([]); // Reset the cart after transaction
      fetchTransactions();
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  };

  const handleCardPayment = async (paymentMethod: string) => {
    const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    try {
      const transactionData: Omit<Transaction, 'id'> = {
        items: cart,
        totalAmount,
        date: Timestamp.now(),
        paymentMethod: paymentMethod,
        isDeleted: false,
        change: 0, // No change for card payment
        orderId: generateOrderId(), //
      };
      const transactionId = await addTransaction(transactionData);
      const newTransaction: Transaction = { ...transactionData, id: transactionId }; // Create full Transact
      setSavedTransaction(newTransaction);
      setCart([]); // Reset the cart after transaction
      fetchTransactions();
    } catch (error) {
      console.error('Failed to process card payment:', error);
    }
  };

  // Add handleDeleteTransaction function to delete a transaction
  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id); // Call Firebase service to delete the transaction
      setTransactions(transactions.filter((transaction) => transaction.id !== id));
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  // Create the analytics function to calculate product sales data
  const getProductAnalytics = (): ProductAnalyticsType[] => {
    const analytics: ProductAnalyticsType[] = [];
  
    // Use the `transactions` state directly in the function
    transactions.forEach((transaction) => {
      transaction.items.forEach((item) => {
        const existingProduct = analytics.find((prod) => prod.productId === item.id);
  
        if (existingProduct) {
          existingProduct.totalQuantitySold += item.quantity;
          existingProduct.totalRevenue += item.price * item.quantity;
          existingProduct.numberOfSales += 1;
        } else {
          analytics.push({
            productId: item.id,
            productName: item.name,
            totalQuantitySold: item.quantity,
            totalRevenue: item.price * item.quantity,
            numberOfSales: 1,
            date: new Date(transaction.date.toMillis()), // Make sure date is included
          });
        }
      });
    });
  
    return analytics;
  };

  return (
    <PosContext.Provider
      value={{
        products,
        fetchProducts,
        cart,
        transactions,
        change,
        savedTransaction,
        setCart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        handleCashPayment,
        handleCardPayment,
        fetchTransactions,
        handleDeleteTransaction, // Provide the delete handler in context
        getProductAnalytics,
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

// Custom hook to use the PosContext
export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
};
