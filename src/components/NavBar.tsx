// src/components/NavBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from 'firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faUser, faSignOutAlt, faUsers, faChevronDown, faClock } from '@fortawesome/free-solid-svg-icons';

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // State to manage menu collapse
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to manage dropdown visibility
  const [currentTime, setCurrentTime] = useState(''); // State to track current time
  const dropdownRef = useRef<HTMLLIElement>(null); // Reference to the dropdown menu with correct type
  const { user, isAdmin } = useAuth(); // Get user and admin info from AuthContext
  const navigate = useNavigate();

  useEffect(() => {
    // Update the time every second
    const intervalId = setInterval(() => {
      const now = new Date();
      // Format the time in 12-hour format with AM/PM
      const formattedTime = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
      });
      setCurrentTime(formattedTime);
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    // Add event listener for clicks
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Remove event listener on cleanup
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

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
        {/* Live Time Display - Left Aligned */}
        <div className="flex items-center">
          <FontAwesomeIcon icon={faClock} className="mr-2" />
          <span className="text-lg font-semibold">{currentTime}</span>
        </div>

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
              <li className="relative" ref={dropdownRef}>
                {/* Main Dropdown Menu Item */}
                <button
                  onClick={toggleDropdown}
                  className="flex items-center w-full md:w-auto px-4 py-2 hover:bg-blue-500 md:hover:bg-transparent focus:outline-none"
                >
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  {user.email}
                  <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
                </button>

                {/* Dropdown Submenu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-full md:w-48 bg-white text-gray-800 shadow-lg rounded-lg z-20">
                    <ul className="flex flex-col p-2">
                      {isAdmin && (
                        <li
                          className="hover:bg-gray-200 rounded-md px-4 py-2 cursor-pointer w-full"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate('/admin'); // Use navigate to redirect
                          }}
                        >
                          <div className="flex items-center w-full h-full">
                            <Link className="w-full h-full" to="/admin">
                              Admin Dashboard
                            </Link>
                          </div>
                        </li>
                      )}

                      <li
                        className="hover:bg-gray-200 rounded-md px-4 py-2 cursor-pointer w-full"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('/pos'); // Use navigate to redirect
                        }}
                      >
                        <div className="flex items-center w-full h-full">
                          <Link className="w-full h-full" to="/pos">
                            POS
                          </Link>
                        </div>
                      </li>

                      {!isAdmin && (
                        <li
                          className="hover:bg-gray-200 rounded-md px-4 py-2 cursor-pointer w-full"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate('/transactions'); // Use navigate to redirect
                          }}
                        >
                          <div className="flex items-center w-full h-full">
                            <Link className="w-full h-full" to="/transactions">
                              Transactions
                            </Link>
                          </div>
                        </li>
                      )}

                      {/* Logout Button */}
                      <li
                        className="hover:bg-gray-200 rounded-md px-4 py-2 cursor-pointer w-full"
                        onClick={() => {
                          handleLogout();
                          setIsDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center w-full h-full">
                          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                          Logout
                        </div>
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
