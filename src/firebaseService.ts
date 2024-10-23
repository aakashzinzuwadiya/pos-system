// src/firebaseService.ts
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, orderBy, query, getFirestore, getDoc } from "firebase/firestore";
import { auth, db, app } from "./firebaseConfig";
import { Product, Transaction, User } from "./types"; // Import Product type
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";

const firestore = getFirestore(app);
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
    // Query products ordered by category
    const productsQuery = query(productsCollection, orderBy('category', 'asc')); // 'asc' for ascending order, 'desc' for descending
    const productsSnapshot = await getDocs(productsQuery);

    return productsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product)); // Type cast the response as Product[]
  } catch (error) {
    console.error('Error fetching products: ', error);
    throw new Error('Failed to fetch products');
  }
};

/// Function to add a new transaction
export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  const transactionCollection = collection(db, 'transactions');

  // Add the new transaction to Firestore
  const docRef = await addDoc(transactionCollection, transaction);
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

// Function to delete a transaction from Firestore
export const deleteTransaction = async (id: string): Promise<void> => {
  const docRef = doc(db, 'transactions', id);
  await deleteDoc(docRef);
  console.log(`Transaction with ID: ${id} deleted successfully.`);
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

// Fetch all users
export const getUsers = async (): Promise<User[]> => {
  const users: User[] = [];
  const querySnapshot = await getDocs(collection(db, 'users')); // Replace with your Firebase Firestore collection

  querySnapshot.forEach((doc) => {
    const { id, ...data } = doc.data() as User; // Extract `id` from `data` if it exists
    users.push({ id: doc.id, ...data }); // Use `doc.id` as the unique identifier
  });

  return users;
};

// Updated addUser function to create user in Firebase Authentication and Firestore
export const addUser = async (user: Omit<User, 'password'>) => {
  try {
      const usersCollectionRef = collection(firestore, 'users');
      const userRef = await addDoc(usersCollectionRef, {
          email: user.email,
          role: user.role,
          id: user.id, // Store Firebase Auth UID as user ID
      });
      return userRef.id;
  } catch (error) {
      console.error('Error adding user to Firestore:', error);
      throw new Error('Failed to add user');
  }
};


// Update an existing user
export const updateUser = async (id: string, user: Omit<User, 'id'>) => {
  const docRef = doc(db, 'users', id);
  await updateDoc(docRef, user);
};

// Delete a user
export const deleteUser = async (id: string) => {
  const docRef = doc(db, 'users', id);
  await deleteDoc(docRef);
};

// Function to update user password
export const updateUserPassword = async (userId: string, newPassword: string) => {
  // Get the current user from auth context
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No authenticated user found.');
  }

  // Reauthenticate the user if required
  // (optional) Depending on security requirements, you can ask the user for their current password to reauthenticate
  // Example for re-authentication (optional):
  // const credential = EmailAuthProvider.credential(user.email!, currentPassword);
  // await reauthenticateWithCredential(user, credential);

  // Update the password in Firebase Authentication
  await updatePassword(user, newPassword);

  // Update Firestore to reflect the password change (if necessary)
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    passwordUpdated: new Date().toISOString(), // You can store a timestamp instead of the password itself
  });
};