const MessageBubble = ({ message }) => {
    return (
      <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
        <div className={`max-w-[80%] rounded-lg p-4 ${
          message.type === 'user'
            ? 'bg-blue-600 shadow-lg shadow-blue-500/20'
            : 'bg-gray-700/90 shadow-lg'
        }`}>
          <p className="text-white whitespace-pre-line leading-relaxed">{message.content}</p>
          {message.recommendations && message.recommendations.sunscreen?.length > 0 && (
            <div className="mt-4 space-y-3">
              {message.recommendations.sunscreen.map((rec, idx) => (
                <ProductCard key={idx} product={rec} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };