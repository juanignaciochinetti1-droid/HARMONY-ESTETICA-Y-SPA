import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roleRequired }) => {
  const { profile, loading } = useAuth();

  if (loading) return null; 

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  if (roleRequired && profile.rol !== roleRequired) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ESTA LÍNEA ES LA QUE FALTA O ESTÁ MAL:
export default ProtectedRoute;