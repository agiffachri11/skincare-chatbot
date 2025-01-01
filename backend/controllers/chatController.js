const { Chat, Product } = require('../models');

const chatFlow = {
  WELCOME: 0,
  ASK_SKIN_TYPE: 1,
  ASK_CONCERN: 2,
  ASK_BUDGET: 3,
  GIVE_RECOMMENDATIONS: 4
};

// Helper function
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

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
            message: "👋 Halo! Saya adalah SkinBot, asisten skincare Anda.\n\n💆‍♀️ Untuk memberikan rekomendasi yang tepat, saya perlu mengetahui beberapa hal tentang kulit Anda.\n\n📝 Pertama, mohon pilih jenis kulit Anda:",
            options: ["Normal", "Berminyak", "Kering"]
          };
          break;

        case chatFlow.ASK_SKIN_TYPE:
          const skinType = message.toLowerCase();
          if (!['normal', 'berminyak', 'kering'].includes(skinType)) {
            response = {
              message: "❌ Maaf, pilihan tidak valid. Silakan pilih salah satu jenis kulit berikut:",
              options: ["Normal", "Berminyak", "Kering"]
            };
            break;
          }

          chat.data.skinType = skinType;
          chat.step = chatFlow.ASK_CONCERN;
          response = {
            message: "✅ Baik, saya mengerti jenis kulit Anda.\n\n🤔 Selanjutnya, apa masalah kulit utama yang ingin Anda atasi?",
            options: ["Jerawat", "Kulit Kusam", "Kulit Kering", "Tidak ada masalah khusus"]
          };
          break;

        case chatFlow.ASK_CONCERN:
          chat.data.concern = message;
          chat.step = chatFlow.ASK_BUDGET;
          response = {
            message: "💭 Terima kasih atas informasinya.\n\n💰 Terakhir, berapa budget yang Anda siapkan untuk sunscreen?",
            options: ["0-100rb", "100-200rb", "Diatas 200rb"]
          };
          break;

        case chatFlow.ASK_BUDGET:
          chat.data.budget = message;
          chat.step = chatFlow.GIVE_RECOMMENDATIONS;

          // Debug logs
          console.log('Search criteria:', {
            skinType: chat.data.skinType,
            concern: chat.data.concern,
            budget: chat.data.budget
          });

          const priceRange = {
            '0-100rb': { $lt: 100000 },
            '100-200rb': { $gte: 100000, $lte: 200000 },
            'Diatas 200rb': { $gt: 200000 }
          };

          const queryParams = {
            skinType: chat.data.skinType,
            category: 'sunscreen',
            price: priceRange[chat.data.budget]
          };

          if (chat.data.concern !== 'Tidak ada masalah khusus') {
            queryParams.concerns = chat.data.concern.toLowerCase();
          }

          console.log('Query params:', queryParams);
          const products = await Product.find(queryParams);
          console.log('Found products:', products);

          if (!products || products.length === 0) {
            response = {
              message: `❌ Maaf, tidak ditemukan produk yang sesuai dengan kriteria Anda:

                🔹 Jenis Kulit: ${capitalizeFirstLetter(chat.data.skinType)}
                🔹 Masalah Utama: ${chat.data.concern}
                🔹 Range Budget: ${chat.data.budget}

                💡 Silakan coba dengan kriteria lain.`,
                            options: ["Mulai Konsultasi Baru"]
                            };
                        } else {
                            const recommendationsList = products.map(p => 
                            `🔸 ${p.name}
                💰 ${formatPrice(p.price)}
                📝 ${p.description}`
                            ).join('\n\n');

                            response = {
                            message: `✨ Hasil Analisis Profil Kulit Anda:

                👤 Jenis Kulit: ${capitalizeFirstLetter(chat.data.skinType)}
                🎯 Masalah Utama: ${chat.data.concern}
                💰 Range Budget: ${chat.data.budget}

                🌟 Rekomendasi Sunscreen untuk Anda:

                ${recommendationsList}`,
              recommendations: {
                sunscreen: products.map(p => ({
                  name: p.name,
                  price: formatPrice(p.price),
                  description: p.description
                }))
              },
              options: ["Mulai Konsultasi Baru"]
            };
          }

          // Reset chat untuk konsultasi baru
          chat.step = chatFlow.WELCOME;
          chat.data = {};
          break;

        default:
          chat.step = chatFlow.WELCOME;
          response = {
            message: "❌ Maaf, terjadi kesalahan. Mari mulai dari awal.",
            options: ["Mulai Konsultasi"]
          };
      }

      chat.messages.push({
        type: 'bot',
        content: response.message
      });

      await chat.save();
      console.log('Final response:', response);
      res.json(response);

    } catch (error) {
      console.error('Error in chat controller:', error);
      res.status(500).json({ 
        message: 'Maaf, terjadi kesalahan pada server. Silakan coba beberapa saat lagi.',
        options: ["Mulai Konsultasi Baru"]
      });
    }
  }
};

module.exports = chatController;