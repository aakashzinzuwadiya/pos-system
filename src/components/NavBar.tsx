// src/components/NavBar.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import { auth } from 'firebaseConfig';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth(); // `useAuth` should now have `user` and `isAdmin` properties

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <div>
        <Link to={'/pos'}>Pos System</Link>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            {isAdmin ? <span className="font-semibold">Hello, Admin</span> : <span className="font-semibold">Hello, User</span>}
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition">
              Logout
            </button>
          </>
        ) : (
          <button onClick={() => navigate('/login')} className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition">
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
