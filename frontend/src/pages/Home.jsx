import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-4xl text-white font-bold mb-8">
            Selamat Datang di SkinCare Assistant
          </h1>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Asisten AI yang akan membantu Anda menemukan produk sunscreen 
            yang tepat sesuai dengan jenis kulit dan kebutuhan Anda.
          </p>
          <button
            onClick={() => window.location.href = '/chat'}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Mulai Konsultasi
          </button>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            title="Analisis Kulit"
            description="Analisis jenis kulit Anda untuk mendapatkan rekomendasi yang tepat."
          />
          <FeatureCard 
            title="Rekomendasi Personal"
            description="Dapatkan rekomendasi produk sunscreen yang sesuai dengan kebutuhan Anda."
          />
          <FeatureCard 
            title="Konsultasi Mudah"
            description="Proses konsultasi yang mudah dan interaktif melalui chat."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl text-white font-semibold mb-4">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
};

export default Home;