import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h1 className="text-white text-xl font-bold">SkinCare Assistant</h1>
          <button 
            onClick={() => navigate('/home')}
            className="text-gray-300 hover:text-white"
          >
            Home
          </button>
          <button 
            onClick={() => navigate('/chat')}
            className="text-gray-300 hover:text-white"
          >
            Chat
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;