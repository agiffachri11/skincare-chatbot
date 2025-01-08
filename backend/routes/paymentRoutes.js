const express = require('express');
const router = express.Router();
const { Product, Payment, User, Transaction } = require('../models');
const { protect } = require('../middleware/auth');

// Endpoint untuk membuat pembayaran baru
router.post('/create-payment', protect, async (req, res) => {
 try {
   const { productId, currency = 'SOL' } = req.body;
   
   // Ambil detail produk
   const product = await Product.findById(productId);
   if (!product) {
     return res.status(404).json({ message: 'Produk tidak ditemukan' });
   }

   // Buat pembayaran di solstrafi
   const paymentResponse = await fetch('https://api-staging.solstra.fi/service/pay/create', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer 7c2e9f0c-3500-4b83-8798-8f7068c422e4'
     },
     body: JSON.stringify({
       currency,
       amount: product.price,
       webhookURL: 'https://skincare-chatbot-production.up.railway.app/api/payment/webhook' 
     })
   });

   const paymentData = await paymentResponse.json();

   // Simpan data pembayaran ke database
   const payment = new Payment({
     userId: req.user._id,
     productId: product._id,
     amount: product.price,
     currency,
     paymentId: paymentData.data.id,
     walletAddress: paymentData.data.walletAddress
   });

   await payment.save();

   // Buat transaksi awal dengan status pending
   const transaction = new Transaction({
     userId: req.user._id,
     productId: product._id,
     paymentId: paymentData.data.id,
     amount: product.price,
     currency,
     productName: product.name,
     buyerName: req.user.username,
     status: 'pending'
   });

   await transaction.save();

   res.json({
     status: 'success',
     data: {
       ...paymentData.data,
       productName: product.name,
       productPrice: product.price
     }
   });

 } catch (error) {
   console.error('Payment error:', error);
   res.status(500).json({ message: 'Terjadi kesalahan dalam pembuatan pembayaran' });
 }
});

// Endpoint untuk mengecek status pembayaran
router.get('/check/:paymentId', protect, async (req, res) => {
 try {
   const { paymentId } = req.params;

   const checkResponse = await fetch(`https://api-staging.solstra.fi/service/pay/${paymentId}/check`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer API_KEY_SOLSTRAFI'
     }
   });

   const checkData = await checkResponse.json();
   res.json(checkData);

 } catch (error) {
   console.error('Payment check error:', error);
   res.status(500).json({ message: 'Gagal mengecek status pembayaran' });
 }
});

// Endpoint untuk webhook (callback dari solstrafi)
router.post('/webhook', async (req, res) => {
 try {
   const { paymentId, status } = req.body;

   const payment = await Payment.findOne({ paymentId });
   if (payment) {
     payment.status = status === 'paid' ? 'paid' : 'failed';
     await payment.save();

     if (status === 'paid') {
       // Update status pembayaran
       await Payment.findOneAndUpdate(
         { paymentId },
         { 
           status: 'paid',
           updatedAt: new Date()
         }
       );

       // Update status transaksi
       await Transaction.findOneAndUpdate(
         { paymentId },
         {
           status: 'completed',
           updatedAt: new Date()
         }
       );

       console.log(`Payment ${paymentId} has been processed successfully`);
       
       res.json({ 
         received: true,
         status: 'success',
         message: 'Payment processed successfully'
       });
     } else {
       // Update status transaksi menjadi failed
       await Transaction.findOneAndUpdate(
         { paymentId },
         {
           status: 'failed',
           updatedAt: new Date()
         }
       );

       res.json({
         received: true,
         status: 'failed',
         message: 'Payment failed'
       });
     }
   } else {
     res.status(404).json({ message: 'Payment not found' });
   }
 } catch (error) {
   console.error('Webhook error:', error);
   res.status(500).json({ message: 'Error processing webhook' });
 }
});

// Endpoint untuk mendapatkan history transaksi user
router.get('/transactions', protect, async (req, res) => {
 try {
   const transactions = await Transaction.find({ userId: req.user._id })
     .sort({ createdAt: -1 }); // Urutkan dari yang terbaru

   res.json({
     status: 'success',
     data: transactions
   });

 } catch (error) {
   console.error('Transaction history error:', error);
   res.status(500).json({ message: 'Gagal mengambil history transaksi' });
 }
});

// Endpoint untuk mendapatkan detail transaksi
router.get('/transaction/:transactionId', protect, async (req, res) => {
 try {
   const transaction = await Transaction.findOne({
     _id: req.params.transactionId,
     userId: req.user._id
   });

   if (!transaction) {
     return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
   }

   res.json({
     status: 'success',
     data: transaction
   });

 } catch (error) {
   console.error('Transaction detail error:', error);
   res.status(500).json({ message: 'Gagal mengambil detail transaksi' });
 }
});

module.exports = router;