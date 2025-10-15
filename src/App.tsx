import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from 'components/LoginPage';
import AdminPage from './pages/AdminPage';
import PosPage from './pages/PosPage';
import TransactionPage from 'pages/TransactionPage';
import UserManagement from 'components/UserManagement';
import Reports from 'components/Reports';
import SalesSummary from 'components/SalesSummary';
import ProductAnalytics from 'components/ProductAnalytics';

// Auth wrapper
const RequireAuth: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/pos" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const location = useLocation();

  if (token && location.pathname === '/login') {
    return <Navigate to="/pos" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAuth adminOnly={true}>
            <AdminPage />
          </RequireAuth>
        }
      />
      <Route
        path="/pos"
        element={
          <RequireAuth>
            <PosPage />
          </RequireAuth>
        }
      />
      <Route
        path="/transactions"
        element={
          <RequireAuth adminOnly={true}>
            <TransactionPage />
          </RequireAuth>
        }
      />
      <Route
        path="/reports"
        element={
          <RequireAuth adminOnly={true}>
            <Reports />
          </RequireAuth>
        }
      >
        <Route
          path="sales-summary"
          element={<SalesSummary filterDates={{ startDate: '', endDate: '' }} />}
        />
        <Route
          path="product-analytics"
          element={<ProductAnalytics filterDates={{ startDate: '', endDate: '' }} />}
        />
      </Route>
      <Route
        path="/users"
        element={
          <RequireAuth adminOnly={true}>
            <UserManagement />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to={isAdmin ? '/admin' : '/pos'} />} />
    </Routes>
  );
};

export default App;
