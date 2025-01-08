import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const PaymentModal = ({ product, onClose }) => {
  const { token } = useAuth();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let intervalId;
    if (paymentInfo?.paymentId) {
      intervalId = setInterval(checkPaymentStatus, 10000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [paymentInfo]);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`https://skincare-chatbot-production.up.railway.app/api/payment/check/${paymentInfo.paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.data?.isPaid) {
        setPaymentStatus('paid');
        onClose();
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('https://skincare-chatbot-production.up.railway.app/api/payment/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          currency: 'SOL'
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setPaymentInfo(data.data);
      } else {
        setError(data.message || 'Terjadi kesalahan saat membuat pembayaran');
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Pembayaran</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {!paymentInfo ? (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-gray-400">Produk</p>
                <p className="text-white font-medium">{product.name}</p>
              </div>
              <div>
                <p className="text-gray-400">Harga</p>
                <p className="text-white font-medium">{product.price}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Memproses...' : 'Bayar Sekarang'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Batal
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-gray-400">Jumlah yang harus dibayar</p>
              <p className="text-white font-bold text-xl">
                {paymentInfo.amount} {paymentInfo.currency}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Alamat Wallet</p>
              <p className="text-white font-mono bg-gray-700 p-2 rounded break-all">
                {paymentInfo.walletAddress}
              </p>
            </div>
            <p className="text-gray-300 text-sm">
              Silakan transfer sesuai jumlah yang tertera ke alamat wallet di atas.
              Status pembayaran akan diupdate secara otomatis setelah pembayaran berhasil.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;