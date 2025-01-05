import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { token } = useAuth();
    console.log('Protected Route - Token:', token);
    
    if (!token) {
      console.log('No token, redirecting to login');
      return <Navigate to="/login" />;
    }
    
    return children;
  };

export default ProtectedRoute;