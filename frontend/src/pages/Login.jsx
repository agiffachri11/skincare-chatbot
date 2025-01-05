import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const success = await login(email, password);
        if (success) {
          navigate('/home');
        } else {
          setError('Login failed. Check your credentials.');
        }
      } catch (error) {
        setError('An error occurred during login.');
      }
    };
  
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96">
          <h1 className="text-3xl text-white font-bold mb-6">Login</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded text-white"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Login
            </button>
            
            <p className="text-center text-gray-300 mt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300">
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    );
  };
  
  export default Login;