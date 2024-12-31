const { Chat, Product } = require('../models');

const chatFlow = {
  WELCOME: 0,
  ASK_SKIN_TYPE: 1,
  ASK_CONCERN: 2,
  ASK_BUDGET: 3,
  GIVE_RECOMMENDATIONS: 4
};

const chatController = {
  handleChat: async (req, res) => {
    console.log('=== Chat Request ===');
    const { userId, message } = req.body;
    console.log('Request received:', { userId, message });

    try {
      let chat = await Chat.findOne({ userId });
      console.log('Existing chat:', chat);

      if (!chat) {
        chat = new Chat({ userId });
        console.log('New chat created:', chat);
      }

      if (message) {
        chat.messages.push({
          type: 'user',
          content: message
        });
      }

      let response = {};

      switch (chat.step) {
        case chatFlow.WELCOME:
          chat.step = chatFlow.ASK_SKIN_TYPE;
          response = {
            message: "Halo! Saya adalah SkinBot, asisten skincare Anda. Untuk memberikan rekomendasi yang tepat, saya perlu tahu jenis kulit Anda. Apakah kulit Anda:",
            options: ["Normal", "Berminyak", "Kering", "Kombinasi"]
          };
          break;

        case chatFlow.ASK_SKIN_TYPE:
          const skinType = message.toLowerCase();
          if (!['normal', 'berminyak', 'kering', 'kombinasi'].includes(skinType)) {
            response = {
              message: "Maaf, pilihan tidak valid. Silakan pilih: Normal, Berminyak, Kering, atau Kombinasi",
              options: ["Normal", "Berminyak", "Kering", "Kombinasi"]
            };
            break;
          }

          chat.data.skinType = skinType;
          chat.step = chatFlow.ASK_CONCERN;
          response = {
            message: "Apa masalah kulit utama yang ingin Anda atasi?",
            options: ["Jerawat", "Kulit Kusam", "Pori-pori Besar", "Kulit Kering", "Tidak ada masalah khusus"]
          };
          break;

        case chatFlow.ASK_CONCERN:
          chat.data.concern = message;
          chat.step = chatFlow.ASK_BUDGET;
          response = {
            message: "Berapa budget yang Anda siapkan untuk 1 produk skincare?",
            options: ["Dibawah 50rb", "50-100rb", "100-200rb", "Diatas 200rb"]
          };
          break;

        case chatFlow.ASK_BUDGET:
          chat.data.budget = message;
          chat.step = chatFlow.GIVE_RECOMMENDATIONS;

          const priceRange = {
            'Dibawah 50rb': { $lt: 50000 },
            '50-100rb': { $gte: 50000, $lte: 100000 },
            '100-200rb': { $gt: 100000, $lte: 200000 },
            'Diatas 200rb': { $gt: 200000 }
          };

          const products = await Product.find({
            skinType: chat.data.skinType,
            price: priceRange[chat.data.budget] || {},
            ...(chat.data.concern !== 'Tidak ada masalah khusus' && {
              concerns: chat.data.concern.toLowerCase()
            })
          });

          const recommendations = {
            cleanser: products.filter(p => p.category === 'cleanser').map(p => p.name),
            moisturizer: products.filter(p => p.category === 'moisturizer').map(p => p.name),
            sunscreen: products.filter(p => p.category === 'sunscreen').map(p => p.name)
          };

          response = {
            message: `Berdasarkan informasi yang Anda berikan:\nJenis Kulit: ${chat.data.skinType}\nMasalah Utama: ${chat.data.concern}\nBudget: ${chat.data.budget}\n\nBerikut rekomendasi produk untuk Anda:`,
            recommendations,
            options: ["Mulai Konsultasi Baru"]
          };

          chat.step = chatFlow.WELCOME;
          chat.data = {};
          break;

        default:
          chat.step = chatFlow.WELCOME;
          response = {
            message: "Maaf, terjadi kesalahan. Mari mulai dari awal.",
            options: ["Mulai Konsultasi"]
          };
      }

      chat.messages.push({
        type: 'bot',
        content: response.message
      });

      await chat.save();
      console.log('Response:', response);
      res.json(response);

    } catch (error) {
      console.error('Error in chat controller:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }
};

module.exports = chatController;