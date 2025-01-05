import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-900 relative overflow-hidden">
      <nav className="absolute top-0 left-0 right-0 p-4">
        <div className="max-w-7xl mx-auto flex justify-end space-x-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2 text-white hover:text-blue-200 transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Register
          </button>
        </div>
      </nav>

      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            SkinCare Assistant
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12">
            Temukan rekomendasi sunscreen yang tepat untuk kulit Anda melalui 
            analisis AI yang personal dan akurat
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:scale-105"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 border border-white text-white rounded-lg hover:bg-white/10 transition-all hover:scale-105"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};

export default LandingPage;