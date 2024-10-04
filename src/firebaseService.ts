// src/firebaseService.ts
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, DocumentData, Timestamp, orderBy, query, limit, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { Product, Transaction } from "./types"; // Import Product type

// Firestore collection references
const productsCollection = collection(db, "products");
const transactionsCollection = collection(db, "transactions");

// Add a new product to the Firestore database
export const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(productsCollection, product);
    return docRef.id;
  } catch (error) {
    console.error("Error adding product: ", error);
    throw new Error("Failed to add product");
  }
};

// Update an existing product in Firestore
export const updateProduct = async (id: string, updatedProduct: Omit<Product, 'id'>) => {
  try {
    const productDoc = doc(db, "products", id);
    await updateDoc(productDoc, updatedProduct);
  } catch (error) {
    console.error("Error updating product: ", error);
    throw new Error("Failed to update product");
  }
};

// Delete a product from Firestore
export const deleteProduct = async (id: string) => {
  try {
    const productDoc = doc(db, "products", id);
    await deleteDoc(productDoc);
  } catch (error) {
    console.error("Error deleting product: ", error);
    throw new Error("Failed to delete product");
  }
};

// Fetch all products from Firestore
export const getProducts = async (): Promise<Product[]> => {
  try {
    const productsSnapshot = await getDocs(productsCollection);
    return productsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product)); // Type cast the response as Product[]
  } catch (error) {
    console.error("Error fetching products: ", error);
    throw new Error("Failed to fetch products");
  }
};

/// Function to add a new transaction
export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  const transactionCollection = collection(db, 'transactions');

  // Get the last transaction's orderId to calculate the next one
  const q = query(transactionCollection, orderBy('orderId', 'desc'), limit(1));
  const querySnapshot = await getDocs(q);

  let nextOrderId = 1; // Default to 1 if no previous transactions exist
  if (!querySnapshot.empty) {
    const lastTransaction = querySnapshot.docs[0].data();
    nextOrderId = (lastTransaction.orderId || 0) + 1;
  }

  // Add the orderId to the transaction
  const newTransaction = { ...transaction, orderId: nextOrderId };

  // Add the new transaction to Firestore
  const docRef = await addDoc(transactionCollection, newTransaction);
  return docRef.id; // Return the document ID
};

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const transactionsSnapshot = await getDocs(transactionsCollection);
    const transactionsList = transactionsSnapshot.docs.map((doc) => ({
      id: doc.id, // Use the document ID as the transaction ID
      ...doc.data(),
    })) as Transaction[]; // Cast to Transaction type
    return transactionsList;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const updateTransaction = async (id: string, data: Partial<Transaction>): Promise<void> => {
  const transactionDoc = doc(db, 'transactions', id);
  await updateDoc(transactionDoc, data);
};

export const getUserRole = async (uid: string): Promise<string | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data()?.role || null; // Return the role if it exists
    }
    return null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};