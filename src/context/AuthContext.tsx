// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getUserRole } from '../firebaseService'; // Import Firebase service functions as needed
import { auth } from '../firebaseConfig'; // Ensure you have this import configured correctly
import { User } from 'firebase/auth';

interface AuthContextProps {
  user: User | null; // This should match the Firebase User type
  isAdmin: boolean;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // Optional: Function to set user
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up the onAuthStateChanged listener
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);

        // Check if the user is an admin based on their email
        const isAdminUser = ['aakashsoni96@gmail.com', 'ssoni@gmail.com'].includes(user.email || '');
        setIsAdmin(isAdminUser);

        // If using Firestore to manage roles, uncomment the following line and comment the above lines:
        // const role = await getUserRole(user.uid);
        // setIsAdmin(role === 'admin');
      } else {
        // Reset user and admin state when not logged in
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
