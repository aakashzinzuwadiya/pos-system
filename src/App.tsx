// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from 'components/LoginPage';
import AdminPage from './pages/AdminPage';
import PosPage from './pages/PosPage';
import TransactionPage from 'pages/TransactionPage';
import ProductAnalytics from 'components/ProductAnalytics';
import UserManagement from 'components/UserManagement';
import Reports from 'components/Reports';
import SalesSummary from 'components/SalesSummary';
// import ProductSaleSummary from 'components/ProductSaleSummary';

const App: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={isAdmin ? '/admin' : '/pos'} />} />
      <Route path="/admin" element={user && isAdmin ? <AdminPage /> : <Navigate to="/login" />} />
      <Route path="/pos" element={<PosPage />} />
      <Route path="/transactions" element={<TransactionPage />} />
      <Route path="/reports" element={<Reports />}>
        <Route path="sales-summary" element={<SalesSummary filterDates={{
          startDate: '',
          endDate: ''
        }} />} />
        <Route path="product-analytics" element={<ProductAnalytics filterDates={{
          startDate: '',
          endDate: ''
        }} />} />
      </Route>
      <Route path='/users' element={<UserManagement />} />
      <Route path="*" element={<Navigate to={user ? (isAdmin ? '/admin' : '/pos') : '/login'} />} />
    </Routes>
  );
};

export default App;
