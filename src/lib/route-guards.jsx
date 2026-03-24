import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';

export function RequireAuth({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={createPageUrl('Login')} replace />;
  }

  return children;
}

export function RequireAdmin({ children }) {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
