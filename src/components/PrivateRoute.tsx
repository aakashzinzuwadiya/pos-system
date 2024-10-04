// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  component: React.ComponentType<any>;
  adminRoute?: boolean; // If the route should only be accessible to admins
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, adminRoute = false, ...rest }) => {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminRoute && !isAdmin) {
    return <Navigate to="/pos" />;
  }

  return <Component {...rest} />;
};

export default PrivateRoute;
