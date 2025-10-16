import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col justify-center items-center bg-gray-100 min-h-screen">
      <div className="bg-white shadow-lg p-8 rounded-lg text-center">
        <h1 className="mb-4 font-bold text-indigo-600 text-3xl">404 - Page Not Found</h1>
        <p className="mb-6 text-gray-700">The page you are looking for does not exist.</p>
        <button
          onClick={() => navigate('/pos')}
          className="hover:bg-indigo-700 bg-gradient-to-br from-indigo-500 to-purple-600 px-6 py-2 rounded-md font-semibold text-white transition"
        >
          Go to POS
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
