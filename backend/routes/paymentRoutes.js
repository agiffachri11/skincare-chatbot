const express = require('express');
const router = express.Router();
const axios = require('axios');
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

    // Konversi harga dari Rupiah ke SOL (1 SOL = Rp 3.200.000)
    const SOL_TO_IDR = 3200000; 
    const solAmount = parseFloat((product.price / SOL_TO_IDR).toFixed(8));

    console.log('Conversion details:', {
      originalPrice: product.price,
      solAmount,
      rate: SOL_TO_IDR
    });

    // Buat pembayaran di solstrafi
    const paymentResponse = await axios.post('https://api-staging.solstra.fi/service/pay/create', {
      currency,
      amount: solAmount,
      webhookURL: 'https://skincare-chatbot-production.up.railway.app/api/payment/webhook'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': '7c2e9f0c-3500-4b83-8798-8f7068c422e4'
      }
    });

    const paymentData = paymentResponse.data;
    
    if (paymentData.status !== 'success') {
      throw new Error(paymentData.message || 'Failed to create payment');
    }

    // Simpan data pembayaran ke database
    const payment = new Payment({
      userId: req.user._id,
      productId: product._id,
      amount: solAmount,
      currency,
      paymentID: paymentData.data.id,
      walletAddress: paymentData.data.walletAddress
    });

    await payment.save();

    // Buat transaksi awal dengan status pending
    const transaction = new Transaction({
      userId: req.user._id,
      productId: product._id,
      paymentID: paymentData.data.id,
      amount: solAmount,
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
        id: paymentData.data.id,         // dari Solstrafi
        paymentID: paymentData.data.id,  // untuk konsistensi dengan DB
        productName: product.name,
        originalPrice: `Rp ${product.price.toLocaleString('id-ID')}`,
        convertedAmount: `${solAmount} SOL`,
        rate: `1 SOL = Rp ${SOL_TO_IDR.toLocaleString('id-ID')}`,
        solanaPayLink: `solana:${paymentData.data.walletAddress}` 
      }
    });

  } catch (error) {
    console.error('Payment error:', error.response?.data || error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan dalam pembuatan pembayaran',
      details: error.response?.data || error.message 
    });
  }
});

// Endpoint untuk mengecek status pembayaran
router.get('/check/:paymentID', protect, async (req, res) => {
  try {
    const { paymentID } = req.params;
    console.log('Checking payment status for:', paymentID);

    // Remove trailing semicolon from URL
    const url = `https://api-staging.solstra.fi/service/pay/${paymentID}/check`;
    
    console.log('Request to Solstrafi:', {
      method: 'POST',
      url,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': '7c2e9f0c-3500-4b83-8798-8f7068c422e4'
      }
    });

    const checkResponse = await axios({
      method: 'post',
      url,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': '7c2e9f0c-3500-4b83-8798-8f7068c422e4'
      }
    });

    console.log('Solstrafi response:', checkResponse.data);

    res.json(checkResponse.data);

  } catch (error) {
    console.error('Full error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    
    res.status(500).json({ 
      status: 'error',
      message: 'Gagal mengecek status pembayaran',
      error: error.response?.data || error.message
    });
  }
});

// Endpoint untuk webhook (callback dari solstrafi)
router.post('/webhook', async (req, res) => {
  try {
    const { paymentID } = req.body;

    if (!paymentID) {
      return res.status(400).json({ message: 'paymentID required' });
   }

    const payment = await Payment.findOne({ paymentID });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update transaction status
    await Transaction.findOneAndUpdate(
      { paymentID },
      {
        status: 'completed',
        updatedAt: new Date()
      }
    );

    res.json({ 
      received: true,
      status: 'success',
      message: 'Payment processed successfully'
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Error processing webhook' });
  }
});

// Endpoint untuk mendapatkan history transaksi user
router.get('/transactions', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: transactions
    });

  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({ message: 'Gagal mengambil history transaksi' });
  }
});

// Endpoint untuk cek status transaksi berdasarkan paymentId
router.get('/transaction/:paymentID', protect, async (req, res) => {
  try {
    const { paymentID } = req.params;
    console.log('Checking transaction status for paymentID:', paymentID);
    
    const transaction = await Transaction.findOne({ paymentID });
    console.log('Transaction found:', transaction);

    // Juga cek payment
    const payment = await Payment.findOne({ paymentID });
    console.log('Payment found:', payment);

    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        message: 'Transaksi tidak ditemukan' 
      });
    }

    res.json({
      success: true,
      data: {
        transactionStatus: transaction.status,
        paymentStatus: payment?.status,
        updatedAt: transaction.updatedAt
      }
    });

  } catch (error) {
    console.error('Transaction check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengecek status transaksi' 
    });
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