import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import Notification from './Notification';
import { useAuth } from '../context/AuthContext';

const PaymentModal = ({ product, onClose }) => {
  const { token } = useAuth();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

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
      console.log('Payment status:', data);
      
      if (data.data?.isPaid) {
        setPaymentStatus('paid');
        showNotification('Pembayaran berhasil!', 'success');
        onClose();
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      showNotification('Gagal mengecek status pembayaran', 'error');
    }
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Creating payment for product:', product);

      const payloadData = {
        productId: product.id,
        currency: 'SOL'
      };

      const response = await fetch('https://skincare-chatbot-production.up.railway.app/api/payment/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payloadData)
      });

      const data = await response.json();
      console.log('Payment response:', data);

      if (data.status === 'success') {
        setPaymentInfo(data.data);
        showNotification('Pembayaran siap diproses', 'success');
      } else {
        throw new Error(data.message || 'Terjadi kesalahan saat membuat pembayaran');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Terjadi kesalahan. Silakan coba lagi.');
      showNotification('Gagal membuat pembayaran', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
                  {paymentInfo.convertedAmount}
                </p>
                <p className="text-gray-400 text-sm">
                  ({paymentInfo.originalPrice})
                </p>
              </div>
              
              {/* QR Code */}
              <div className="flex flex-col items-center bg-white p-4 rounded-lg">
                {paymentInfo.solanaPayLink ? (
                  <>
                    <QRCode 
                      value={paymentInfo.solanaPayLink}
                      size={200}
                      level="H"
                      includeMargin
                      renderAs="svg"
                    />
                    <p className="mt-2 text-xs text-gray-600">
                      Scan untuk membayar dengan Solana Pay
                    </p>
                  </>
                ) : (
                  <p className="text-gray-600">QR Code tidak tersedia</p>
                )}
              </div>

              <div>
                <p className="text-gray-400">Alamat Wallet</p>
                <div className="flex items-center space-x-2">
                  <p className="text-white font-mono bg-gray-700 p-2 rounded break-all text-sm">
                    {paymentInfo.walletAddress}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(paymentInfo.walletAddress);
                      showNotification('Alamat wallet disalin!', 'success');
                    }}
                    className="p-2 bg-blue-600 rounded hover:bg-blue-700"
                  >
                    📋
                  </button>
                </div>
              </div>

              <p className="text-gray-300 text-sm">
                Silakan transfer {paymentInfo.convertedAmount} ke alamat wallet di atas.
                Status pembayaran akan diupdate secara otomatis setelah pembayaran berhasil.
              </p>

              {paymentInfo.rate && (
                <p className="text-gray-400 text-xs">
                  Rate: {paymentInfo.rate}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export default PaymentModal;