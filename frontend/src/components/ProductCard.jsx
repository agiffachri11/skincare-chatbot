const ProductCard = ({ product }) => {
    return (
      <div className="bg-gray-600/50 rounded-lg p-4 hover:bg-gray-600/70 transition-colors border border-gray-500/50">
        <h3 className="text-white font-medium text-lg">{product.name}</h3>
        <p className="text-blue-300 font-medium mt-1">{product.price}</p>
        <p className="text-gray-300 text-sm mt-2">{product.description}</p>
      </div>
    );
  };