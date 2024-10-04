// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import PosPage from './pages/PosPage';
import LoginPage from 'components/LoginPage';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  return (
    <div className='App'>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            {/* Admin Route */}
            <Route path="/admin" element={<PrivateRoute component={AdminPage} adminRoute />} />
            {/* POS Route */}
            <Route path="/pos" element={<PrivateRoute component={PosPage} />} />
            {/* Redirect to login if no match */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
          
        </AuthProvider>
      </Router>
    </div>
  );
};

export default App;
