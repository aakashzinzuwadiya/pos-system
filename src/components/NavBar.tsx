import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { auth } from 'firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faUser, faSignOutAlt, faClock } from '@fortawesome/free-solid-svg-icons';

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // State to manage drawer visibility
  const [currentTime, setCurrentTime] = useState(''); // State to track current time
  // const { user, isAdmin } = useAuth(); // Get user and admin info from AuthContext
  const navigate = useNavigate();
  const location = useLocation(); // Get current route

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

  const handleLogout = async () => {
    try {
      // await auth.signOut(); // Log out the user
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  // Map route paths to page names
  const getPageName = () => {
    switch (location.pathname) {
      case '/admin':
        return 'Admin Dashboard';
      case '/pos':
        return 'POS';
      case '/transactions':
        return 'Transactions';
      case '/reports':
        return 'Reports';
      case '/users':
        return 'Users';
      case '/':
        return 'Home';
      default:
        return 'Page';
    }
  };

  return (
    <nav className="bg-blue-600 shadow-md px-4 py-3 text-white">
      <div className="flex justify-between items-center mx-auto container">
        {/* Live Time Display - Left Aligned */}
        <div className="flex items-center">
          <FontAwesomeIcon icon={faClock} className="mr-2" />
          {/* Reserve space using a fixed width for the time, even before it loads */}
          <span className="font-semibold text-lg" style={{ minWidth: '120px', textAlign: 'left' }}>
            {currentTime || ''}
          </span>
        </div>

        {/* Page Name Display - Center Aligned */}
        <div className="flex-grow text-center">
          <h2 className="font-semibold text-xl">{getPageName()}</h2>
        </div>

        {/* Hamburger Menu Icon */}
        <button
          className="text-white"
          onClick={toggleDrawer}
          aria-label="Toggle Drawer"
        >
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} size="lg" />
        </button>

        {/* Drawer */}
        <div
          className={`fixed top-0 right-0 w-64 h-full bg-blue-600 shadow-lg z-50 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'
            } transition-transform duration-300 ease-in-out`}
        >
          {/* Drawer Header */}
          <div className="flex justify-between items-center p-4 border-b border-blue-700">
            <h2 className="font-semibold text-white text-xl">Menu</h2>
            <button onClick={toggleDrawer} className="text-white">
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>

          {/* User Info at the top of the drawer */}
          {/* {user && (
            <div className="flex items-center p-4 border-b border-blue-700">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              <span className="text-white">{user.email}</span>
            </div>
          )} */}

          {/* Drawer Content */}
          <ul className="flex flex-col space-y-4 p-4">
            {(
              <li
                className="hover:bg-blue-700 p-2 rounded-md cursor-pointer"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/admin');
                }}
              >
                Admin Dashboard
              </li>
            )}
            <li
              className="hover:bg-blue-700 p-2 rounded-md cursor-pointer"
              onClick={() => {
                setIsOpen(false);
                navigate('/pos');
              }}
            >
              POS
            </li>
            {/* {!isAdmin && (
              <li
                className="hover:bg-blue-700 p-2 rounded-md cursor-pointer"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/transactions');
                }}
              >
                Transactions
              </li>
            )} */}
            {(
              <li
                className="hover:bg-blue-700 p-2 rounded-md cursor-pointer"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/reports');
                }}
              >
                Reports
              </li>
            )}
            { (
              <li
                className="hover:bg-blue-700 p-2 rounded-md cursor-pointer"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/users');
                }}
              >
                Users
              </li>
            )}
            <li
              className="hover:bg-blue-700 p-2 rounded-md cursor-pointer"
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
              Logout
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
