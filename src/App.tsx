import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from 'components/LoginPage';
import AdminPage from './pages/AdminPage';
import PosPage from './pages/PosPage';
import TransactionPage from 'pages/TransactionPage';
import UserManagement from 'components/UserManagement';
import Reports from 'components/Reports';
import SalesSummary from 'components/SalesSummary';
import ProductAnalytics from 'components/ProductAnalytics';
import NotFoundPage from 'components/NotFoundPage';
import Orders from './pages/Orders';

// Auth wrapper
const RequireAuth: React.FC<{ children: React.ReactNode; adminOnly?: boolean, viewOrdersOnly?: boolean }> = ({ children, adminOnly, viewOrdersOnly }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';
  const isViewOrders = userRole === 'vieworders';
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // Only allow /vieworders for admin or vieworders role
  if (viewOrdersOnly && !(isAdmin || isViewOrders)) {
    return <Navigate to="/pos" replace />;
  }
  // Prevent vieworders role from accessing /pos
  if (!adminOnly && !viewOrdersOnly && isViewOrders) {
    return <Navigate to="/vieworders" replace />;
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/pos" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  // Always redirect to login if not authenticated
  if (!token && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // If authenticated and on /login, redirect to /pos
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
      <Route 
      path="/vieworders"
      element={
        <RequireAuth viewOrdersOnly={true}>
          <Orders />
        </RequireAuth>
      }
      />
      <Route
      path="*"
      element={<NotFoundPage />}
      />
    </Routes>
  );
};

export default App;
