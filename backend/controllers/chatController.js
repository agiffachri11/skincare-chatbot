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

      // Mulai chat session
      const chatSession = model.startChat({
        history: chat.messages.map(msg => ({
          role: msg.type,
          parts: msg.content
        }))
      });

      let response;

      // Jika pesan dari user adalah button option
      if (['Normal', 'Berminyak', 'Kering'].includes(message)) {
        chat.data.skinType = message.toLowerCase();
        response = await chatSession.sendMessage(
          `User memilih jenis kulit ${message}. Tanyakan masalah kulit utama mereka.`
        );
        chat.step = chatFlow.ASK_CONCERN;
      } 
      // Jika masalah kulit
      else if (['Jerawat', 'Kulit Kusam', 'Kulit Kering', 'Tidak ada masalah khusus'].includes(message)) {
        chat.data.concern = message;
        response = await chatSession.sendMessage(
          `User memiliki masalah ${message}. Tanyakan budget mereka untuk sunscreen.`
        );
        chat.step = chatFlow.ASK_BUDGET;
      }
      // Jika budget
      else if (['0-100rb', '100-200rb', 'Diatas 200rb'].includes(message)) {
        const products = await getRecommendations(chat.data.skinType, chat.data.concern, message);
        response = await chatSession.sendMessage(generateProductPrompt(chat.data, products));
        chat.step = chatFlow.WELCOME;
      }
      // Untuk chat bebas dari user
      else {
        response = await chatSession.sendMessage(message || "Halo! Saya SkinBot, asisten skincare Anda.");
      }

      // Simpan pesan
      chat.messages.push(
        { type: 'user', content: message },
        { type: 'bot', content: response.text() }
      );

      await chat.save();

      // Format response
      const responseObj = {
        message: response.text(),
        options: getOptionsForStep(chat.step)
      };

      // Tambahkan rekomendasi jika ada
      if (products) {
        responseObj.recommendations = {
          sunscreen: formatProducts(products)
        };
      }

      res.json(responseObj);

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        message: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        options: ["Mulai Konsultasi Baru"]
      });
    }
  }
};

// Helper functions
const getOptionsForStep = (step) => {
  switch (step) {
    case chatFlow.ASK_SKIN_TYPE:
      return ["Normal", "Berminyak", "Kering"];
    case chatFlow.ASK_CONCERN:
      return ["Jerawat", "Kulit Kusam", "Kulit Kering", "Tidak ada masalah khusus"];
    case chatFlow.ASK_BUDGET:
      return ["0-100rb", "100-200rb", "Diatas 200rb"];
    default:
      return [];
  }
};

const getRecommendations = async (skinType, concern, budget) => {
  const priceRange = {
    '0-100rb': { $lt: 100000 },
    '100-200rb': { $gte: 100000, $lte: 200000 },
    'Diatas 200rb': { $gt: 200000 }
  };

  return await Product.find({
    skinType,
    ...(concern !== 'Tidak ada masalah khusus' && { concerns: concern.toLowerCase() }),
    price: priceRange[budget]
  });
};

const formatProducts = (products) => 
  products.map(p => ({
    name: p.name,
    price: formatPrice(p.price),
    description: p.description
  }));

module.exports = chatController;