import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X } from 'lucide-react';
import Notification from './Notification';
import { useAuth } from '../context/AuthContext';

const PaymentModal = ({ product, onClose }) => {
  const { token } = useAuth();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 menit dalam detik

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Timer countdown
  useEffect(() => {
    if (!paymentInfo) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          showNotification('Waktu pembayaran habis', 'error');
          onClose();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentInfo]);

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Fungsi untuk cek status manual
  const handleCheckStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://skincare-chatbot-production.up.railway.app/api/payment/check/${paymentInfo.paymentID}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      console.log('Payment status:', data);

      if (data.data?.isPaid) {
        setPaymentStatus('paid');
        showNotification('Pembayaran berhasil!', 'success');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        showNotification('Pembayaran belum selesai', 'info');
      }
    } catch (error) {
      console.error('Error checking status:', error);
      showNotification('Gagal mengecek status', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setTimeLeft(300); // Reset timer ke 5 menit

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

  const handleClose = () => {
    if (paymentStatus === 'paid') {
      onClose();
      return;
    }

    if (paymentInfo && !paymentStatus) {
      const confirm = window.confirm('Menutup jendela ini akan membatalkan pembayaran. Lanjutkan?');
      if (!confirm) return;
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Pembayaran</h2>
            <button 
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Timer */}
          {paymentInfo && timeLeft > 0 && !paymentStatus && (
            <div className="mb-4 text-center">
              <p className={`text-sm ${timeLeft < 60 ? 'text-red-400' : 'text-yellow-400'}`}>
                Wallet akan kadaluarsa dalam: {formatTimeLeft()}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {paymentStatus === 'paid' ? (
            <div className="bg-green-500/20 text-green-300 p-4 rounded text-center">
              <p className="text-lg font-semibold">Pembayaran Berhasil!</p>
              <p className="mt-2">Terima kasih atas pembelian Anda.</p>
            </div>
          ) : !paymentInfo ? (
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
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  Batal
                </button>
              </div>
            </>
          ) : timeLeft > 0 ? (
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
                    <QRCodeSVG 
                      value={paymentInfo.solanaPayLink}
                      size={200}
                      level="H"
                      includeMargin
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

              {/* Tombol Check Status */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleCheckStatus}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Mengecek Status...' : 'Cek Status Pembayaran'}
                </button>
              </div>

              <p className="text-gray-300 text-sm">
                Silakan transfer {paymentInfo.convertedAmount} ke alamat wallet di atas.
                Klik tombol di atas untuk mengecek status pembayaran setelah melakukan transfer.
              </p>

              {paymentInfo.rate && (
                <p className="text-gray-400 text-xs">
                  Rate: {paymentInfo.rate}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center text-red-400 p-4">
              Waktu pembayaran telah habis. Silakan coba lagi.
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