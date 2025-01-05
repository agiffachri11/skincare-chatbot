const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Chat, Product } = require('../models');

// Konfigurasi Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const generation_config = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generation_config
});

// Helper function
const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

const chatController = {
  handleChat: async (req, res) => {
    console.log('=== Chat Request ===');
    const { userId, message } = req.body;
    
    try {
      let chat = await Chat.findOne({ userId });
      if (!chat) {
        chat = new Chat({ userId });
      }

      const chatSession = model.startChat({
        history: []
      });

      let responseText;
      let recommendations = null;

      // Cek jika pesan terkait permintaan rekomendasi
      if (message && (message.toLowerCase().includes('rekomendasi') || message.toLowerCase().includes('produk'))) {
        // Cari semua produk dari database
        const products = await Product.find();
        
        // Format prompt untuk Gemini dengan data produk
        const productList = products.map(p => 
          `${p.name} (${formatPrice(p.price)}) - Untuk kulit ${p.skinType} - ${p.description}`
        ).join('\n');

        const prompt = `Berikut adalah daftar produk yang tersedia:
        ${productList}
        
        Tolong berikan rekomendasi yang sesuai dan jelaskan mengapa produk tersebut cocok.`;

        const result = await chatSession.sendMessage(prompt);
        responseText = await result.response.text();

        // Tambahkan data produk ke response
        recommendations = {
          sunscreen: products.map(p => ({
            name: p.name,
            price: formatPrice(p.price),
            description: p.description
          }))
        };
      } else {
        // Untuk pesan umum lainnya
        const result = await chatSession.sendMessage(message || "Perkenalkan dirimu sebagai asisten skincare yang ramah.");
        responseText = await result.response.text();
      }

      // Simpan pesan
      if (message) {
        chat.messages.push({
          type: 'user',
          content: message
        });
      }

      chat.messages.push({
        type: 'bot',
        content: responseText
      });

      await chat.save();

      // Kirim response
      const response = {
        message: responseText,
      };

      // Tambahkan recommendations jika ada
      if (recommendations) {
        response.recommendations = recommendations;
      }

      res.json(response);

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ 
        message: 'Maaf, terjadi kesalahan. Silakan coba lagi.'
      });
    }
  }
};

// Export controller
module.exports = chatController;