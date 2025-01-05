const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Chat, Product } = require('../models');

// Konfigurasi Gemini sesuai kode asli
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

const chatController = {
  handleChat: async (req, res) => {
    console.log('=== Chat Request ===');
    const { userId, message } = req.body;
    console.log('Request received:', { userId, message });

    try {
      let chat = await Chat.findOne({ userId });
      if (!chat) {
        chat = new Chat({ userId });
      }

      const chatSession = model.startChat();
      let responseText;

      // Handle message
      const result = await chatSession.sendMessage(message || "Halo! Perkenalkan saya sebagai asisten skincare.");
      responseText = result.response.text;

      // Save messages
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

      res.json({
        message: responseText,
        options: ["Normal", "Berminyak", "Kering"] // Default options
      });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        message: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        options: ["Mulai Konsultasi Baru"]
      });
    }
  }
};

module.exports = chatController;