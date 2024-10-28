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
  clearCart: () => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;
  handleCashPayment: (cashReceived: number, userEmail: string) => void;
  fetchTransactions: () => void;
  handleCardPayment: (paymentMethod: string, userEmail: string) => void;
  handleDeleteTransaction: (id: string) => Promise<void>;
  getProductAnalytics: () => ProductAnalyticsType[];
  getDaySalesTimestamps: (date: Date) => Promise<{ startOfDaySale: Date | null, endOfDaySale: Date | null }>; // Update this type
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

  // Define clearCart to empty the cart
  const clearCart = () => {
    setCart([]); // Simply reset the cart state to an empty array
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

  const handleCashPayment = async (cashReceived: number, userEmail: string) => {
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
        email: userEmail
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

  const handleCardPayment = async (paymentMethod: string, userEmail: string) => {
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
        email: userEmail
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
  // Assuming `products` is an array containing all products information
  // Example: [{ id: '1', name: 'Product A' }, { id: '2', name: 'Product B' }, ...]

  const getProductAnalytics = (): ProductAnalyticsType[] => {
    const analytics: ProductAnalyticsType[] = [];

    // Step 1: Initialize analytics with all products, setting date to a default value (e.g., epoch date)
    products.forEach((product) => {
      analytics.push({
        productId: product.id,
        productName: product.name,
        totalQuantitySold: 0,
        totalRevenue: 0,
        numberOfSales: 0,
        date: new Date(0), // Default date for products with no sales
      });
    });

    // Step 2: Update analytics with transactions data
    transactions.forEach((transaction) => {
      transaction.items.forEach((item) => {
        const existingProduct = analytics.find((prod) => prod.productId === item.id);

        if (existingProduct) {
          existingProduct.totalQuantitySold += item.quantity;
          existingProduct.totalRevenue += item.price * item.quantity;
          existingProduct.numberOfSales += 1;
          existingProduct.date = new Date(transaction.date.toMillis());
        }
      });
    });

    return analytics;
  };

  const getDaySalesTimestamps = async (date: Date): Promise<{ startOfDaySale: Date | null, endOfDaySale: Date | null }> => {
    // Create start and end times for the given date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0); // Start of the day (00:00:00)
  
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999); // End of the day (23:59:59)
  
    // Query the transactions for the given day
    const dayTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date.toMillis());
      return transactionDate >= startOfDay && transactionDate <= endOfDay;
    });
  
    // If there are no transactions for the given day, return null values
    if (dayTransactions.length === 0) {
      return { startOfDaySale: null, endOfDaySale: null };
    }
  
    // Sort the transactions based on the date to find the first and last transaction of the day
    const sortedTransactions = dayTransactions.sort((a, b) => a.date.toMillis() - b.date.toMillis());
  
    // The first transaction in the sorted array is the start of the day, and the last transaction is the end of the day
    const startOfDaySale = new Date(sortedTransactions[0].date.toMillis());
    const endOfDaySale = new Date(sortedTransactions[sortedTransactions.length - 1].date.toMillis());
  
    return { startOfDaySale, endOfDaySale };
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
        clearCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        handleCashPayment,
        handleCardPayment,
        fetchTransactions,
        handleDeleteTransaction, // Provide the delete handler in context
        getProductAnalytics,
        getDaySalesTimestamps,
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
