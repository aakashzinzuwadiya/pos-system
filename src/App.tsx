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
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  // Redirect authenticated users away from /login to /pos
  if (token && location.pathname === '/login') {
    return <Navigate to="/pos" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
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
          <RequireAuth>
            <TransactionPage />
          </RequireAuth>
        }
      />
      <Route
        path="/reports"
        element={
          <RequireAuth>
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
          <RequireAuth>
            <UserManagement />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to={'/pos'} />} />
    </Routes>
  );
};

export default App;
