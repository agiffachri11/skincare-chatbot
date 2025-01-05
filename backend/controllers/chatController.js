const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Chat, Product } = require('../models');

// Konfigurasi Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({ 
  model: "gemini-pro",
  generationConfig: {
    temperature: 0.9,
    topP: 1,
    topK: 1,
    maxOutputTokens: 2048,
  },
});

const chatFlow = {
  WELCOME: 0,
  ASK_SKIN_TYPE: 1,
  ASK_CONCERN: 2,
  ASK_BUDGET: 3,
  GIVE_RECOMMENDATIONS: 4
};

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

      let response = {};

      try {
        switch (chat.step) {
          case chatFlow.WELCOME:
            chat.step = chatFlow.ASK_SKIN_TYPE;
            response = {
              message: "Halo! Saya adalah SkinBot, asisten skincare Anda. Untuk memberikan rekomendasi yang tepat, saya perlu tahu jenis kulit Anda. Silakan pilih:",
              options: ["Normal", "Berminyak", "Kering"]
            };
            break;

          case chatFlow.ASK_SKIN_TYPE:
            const skinType = message.toLowerCase();
            if (!['normal', 'berminyak', 'kering'].includes(skinType)) {
              response = {
                message: "Maaf, pilihan tidak valid. Silakan pilih jenis kulit Anda:",
                options: ["Normal", "Berminyak", "Kering"]
              };
              break;
            }

            chat.data.skinType = skinType;
            chat.step = chatFlow.ASK_CONCERN;
            response = {
              message: "Terima kasih! Sekarang, apa masalah kulit utama yang ingin Anda atasi?",
              options: ["Jerawat", "Kulit Kusam", "Kulit Kering", "Tidak ada masalah khusus"]
            };
            break;

          case chatFlow.ASK_CONCERN:
            chat.data.concern = message;
            chat.step = chatFlow.ASK_BUDGET;
            response = {
              message: `Saya mengerti masalah kulit Anda. Untuk memberikan rekomendasi sunscreen yang tepat, berapa budget yang Anda siapkan?`,
              options: ["0-100rb", "100-200rb", "Diatas 200rb"]
            };
            break;

          case chatFlow.ASK_BUDGET:
            chat.data.budget = message;
            chat.step = chatFlow.GIVE_RECOMMENDATIONS;

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

            const products = await Product.find(queryParams);

            if (!products || products.length === 0) {
              const prompt = `Berikan respon yang ramah bahwa tidak ada produk yang sesuai untuk:
                Jenis Kulit: ${chat.data.skinType}
                Masalah: ${chat.data.concern}
                Budget: ${chat.data.budget}`;

              const result = await model.generateContent(prompt);
              const generatedText = await result.response.text();

              response = {
                message: generatedText,
                options: ["Mulai Konsultasi Baru"]
              };
            } else {
              const productList = products.map(p => `${p.name} (${formatPrice(p.price)}): ${p.description}`).join('\n');
              const prompt = `Berikan rekomendasi sunscreen dengan gaya yang ramah berdasarkan:
                Jenis Kulit: ${chat.data.skinType}
                Masalah: ${chat.data.concern}
                Budget: ${chat.data.budget}
                
                Daftar produk:
                ${productList}`;

              const result = await model.generateContent(prompt);
              const generatedText = await result.response.text();

              response = {
                message: generatedText,
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

            chat.step = chatFlow.WELCOME;
            chat.data = {};
            break;

          default:
            chat.step = chatFlow.WELCOME;
            response = {
              message: "Maaf, terjadi kesalahan. Mari mulai konsultasi dari awal.",
              options: ["Mulai Konsultasi"]
            };
        }

        if (message) {
          chat.messages.push({
            type: 'user',
            content: message
          });
        }

        chat.messages.push({
          type: 'bot',
          content: response.message
        });

        await chat.save();
        console.log('Final response:', response);
        res.json(response);

      } catch (aiError) {
        console.error('AI Generation Error:', aiError);
        throw aiError;
      }

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