// src/components/NavBar.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from 'firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faUser, faSignOutAlt, faUsers, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // State to manage menu collapse
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to manage dropdown visibility
  const { user, isAdmin } = useAuth(); // Get user and admin info from AuthContext
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Log out the user
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="bg-blue-600 text-white px-4 py-3 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo or Brand Name */}
        <h1>POS System</h1>

        {/* Hamburger Menu Icon for small screens */}
        <button
          className="text-white md:hidden"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} size="lg" />
        </button>

        {/* Collapsible Menu */}
        <div
          className={`md:flex md:items-center md:space-x-6 absolute md:relative top-16 md:top-0 left-0 w-full md:w-auto bg-blue-600 md:bg-transparent transition-all duration-300 ease-in-out ${isOpen ? 'block' : 'hidden md:block'
            }`}
        >
          <ul className="flex flex-col md:flex-row md:space-x-6 md:ml-auto">
            {/* Combined Dropdown Menu */}
            {user && (
              <li className="relative">
                {/* Main Dropdown Menu Item */}
                <button
                  onClick={toggleDropdown}
                  className="flex items-center px-4 py-2 w-full md:w-auto hover:bg-blue-500 md:hover:bg-transparent focus:outline-none"
                >
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  {user.email}
                  <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
                </button>

                {/* Dropdown Submenu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-full bg-white text-gray-800 shadow-lg rounded-lg z-20">
                    <ul className="flex flex-col p-2">
                      {/* Show "Users" link only for admin users */}
                      {/* {isAdmin && (
                        <li className="hover:bg-gray-200 rounded-md px-4 py-2">
                          <Link to="/admin/users" onClick={() => setIsDropdownOpen(false)}>
                            <FontAwesomeIcon icon={faUsers} className="mr-2" />
                            Users
                          </Link>
                        </li>
                      )} */}

                      {isAdmin && (
                        <li className="hover:bg-gray-200 rounded-md px-4 py-2">
                          <Link to="/admin" onClick={() => setIsDropdownOpen(false)}>
                            {/* <FontAwesomeIcon icon={faUsers} className="mr-2" /> */}
                            Admin Dashboard
                          </Link>
                        </li>
                      )}

                      <li className="hover:bg-gray-200 rounded-md px-4 py-2">
                        <Link to="/pos" onClick={() => setIsDropdownOpen(false)}>
                          {/* <FontAwesomeIcon icon={faUsers} className="mr-2" /> */}
                          POS
                        </Link>
                      </li>

                      {!isAdmin && <li className="hover:bg-gray-200 rounded-md px-4 py-2">
                        <Link to="/transactions" onClick={() => setIsDropdownOpen(false)}>
                          Transactions
                        </Link>
                      </li>}


                      {/* Logout Button */}
                      <li className="hover:bg-gray-200 rounded-md px-4 py-2">
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-left"
                        >
                          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            )}

            {/* Show Login button for unauthenticated users */}
            {!user && (
              <li>
                <Link
                  to="/login"
                  className="block px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow md:ml-auto"
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
