// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import PosPage from './pages/PosPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-light min-h-screen">
        <nav className="bg-primary text-white p-4">
          <div className="container mx-auto flex justify-between">
            <Link to="/" className="font-bold text-xl hover:underline">
              POS System
            </Link>
            <div>
              <Link to="/" className="mr-4 hover:underline">
                POS
              </Link>
              <Link to="/admin" className="hover:underline">
                Admin
              </Link>
            </div>
          </div>
        </nav>

        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<PosPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
