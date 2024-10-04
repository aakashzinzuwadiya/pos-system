import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from 'firebaseConfig';

const NavBar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Replace with your actual auth signOut method
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
      {/* Navigation Links */}
      <div className="flex space-x-4">
        
        {/* Conditionally render Admin Dashboard link for admin users */}
        {isAdmin && (
          <Link to="/admin" className="text-lg font-semibold">
            Admin Dashboard
          </Link>
        )}
        
        {/* Show POS Link for all users */}
        <Link to="/pos" className="text-lg font-semibold">
          POS
        </Link>
      </div>

      {/* User Section */}
      <div className="flex items-center space-x-4">
        {user && <span>Welcome, {user.email}</span>}
        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded-lg">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
