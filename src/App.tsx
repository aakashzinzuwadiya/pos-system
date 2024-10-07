// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import PosPage from './pages/PosPage';
import TransactionPage from './pages/TransactionPage';
import LoginPage from 'components/LoginPage';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import UserManagement from 'components/UserManagement';
import { PosProvider } from 'context/PosContext';

const App: React.FC = () => {
  return (
    <div className='App'>

      <Router>
        <AuthProvider>
          <PosProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<PrivateRoute component={AdminPage} adminRoute />} />
            <Route path="/pos" element={<PrivateRoute component={PosPage} />} />
            <Route path="/transactions" element={<PrivateRoute component={TransactionPage} />} />

            <Route path="/admin/users" element={<PrivateRoute component={UserManagement} adminRoute/>} />

            {/* Redirect to login if no match */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
          </PosProvider>
        </AuthProvider>
      </Router>
    </div>
  );
};

export default App;
