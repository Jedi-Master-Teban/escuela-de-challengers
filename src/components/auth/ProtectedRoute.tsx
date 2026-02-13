// ProtectedRoute - Wrapper component for authenticated routes
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen bg-hextech-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-hextech-gold/30 border-t-hextech-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-hextech-gold">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated, saving intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
