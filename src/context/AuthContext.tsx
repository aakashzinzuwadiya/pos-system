// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth } from '../firebaseConfig'; // Ensure you have this import configured correctly
import { browserLocalPersistence, getAuth, onAuthStateChanged, setPersistence, User } from 'firebase/auth';

interface AuthContextProps {
  user: User | null; // This should match the Firebase User type
  isAdmin: boolean;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    // Set the authentication persistence to browser's local storage
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
            
            // Check if the user is an admin based on their email
            const isAdminUser = ['aakashsoni96@gmail.com', 'ssoni@gmail.com'].includes(currentUser.email || '');
            setIsAdmin(isAdminUser);

            // If using Firestore to manage roles, you can use a Firestore call to get the user's role instead:
            // const role = await getUserRole(currentUser.uid);
            // setIsAdmin(role === 'admin');
          } else {
            setUser(null);
            setIsAdmin(false);
          }
          setLoading(false);
        });

        return () => unsubscribe(); // Cleanup the listener on unmount
      })
      .catch((error) => {
        console.error("Error setting auth persistence:", error);
        setLoading(false);
      });
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
