import React from 'react';

const Notification = ({ message, type = 'info', onClose }) => {
  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      'bg-blue-500'
    }`}>
      <p className="text-white">{message}</p>
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-1 right-1 text-white hover:text-gray-200"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Notification;