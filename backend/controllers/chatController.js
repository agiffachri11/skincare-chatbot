const OpenAI = require('openai');
const { Chat, Product } = require('../models');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const chatFlow = {
  WELCOME: 0,
  ASK_SKIN_TYPE: 1,
  ASK_CONCERN: 2,
  ASK_BUDGET: 3,
  GIVE_RECOMMENDATIONS: 4
};

// Helper functions
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
      let aiResponse;

      switch (chat.step) {
        case chatFlow.WELCOME:
          aiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
              role: "system",
              content: "Kamu adalah SkinBot, asisten skincare yang ramah dan profesional. Berikan sapaan hangat dan tanyakan jenis kulit pengguna."
            }]
          });

          chat.step = chatFlow.ASK_SKIN_TYPE;
          response = {
            message: aiResponse.choices[0].message.content,
            options: ["Normal", "Berminyak", "Kering"]
          };
          break;

        case chatFlow.ASK_SKIN_TYPE:
          const skinType = message.toLowerCase();
          if (!['normal', 'berminyak', 'kering'].includes(skinType)) {
            aiResponse = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [{
                role: "system",
                content: "Pengguna memberikan jenis kulit yang tidak valid. Minta mereka memilih dari opsi yang tersedia dengan cara yang ramah."
              }]
            });

            response = {
              message: aiResponse.choices[0].message.content,
              options: ["Normal", "Berminyak", "Kering"]
            };
            break;
          }

          chat.data.skinType = skinType;
          chat.step = chatFlow.ASK_CONCERN;
          
          aiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
              role: "system",
              content: `Pengguna memiliki kulit ${skinType}. Tanyakan masalah kulit utama mereka dengan cara yang empatik.`
            }]
          });

          response = {
            message: aiResponse.choices[0].message.content,
            options: ["Jerawat", "Kulit Kusam", "Kulit Kering", "Tidak ada masalah khusus"]
          };
          break;

        case chatFlow.ASK_CONCERN:
          chat.data.concern = message;
          chat.step = chatFlow.ASK_BUDGET;

          aiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
              role: "system",
              content: `Pengguna memiliki kulit ${chat.data.skinType} dengan masalah ${message}. Tanyakan budget mereka untuk sunscreen dengan cara yang profesional.`
            }]
          });

          response = {
            message: aiResponse.choices[0].message.content,
            options: ["0-100rb", "100-200rb", "Diatas 200rb"]
          };
          break;

        case chatFlow.ASK_BUDGET:
          chat.data.budget = message;
          chat.step = chatFlow.GIVE_RECOMMENDATIONS;

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
            aiResponse = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [{
                role: "system",
                content: `Tidak ditemukan produk yang sesuai untuk:
                Jenis Kulit: ${chat.data.skinType}
                Masalah: ${chat.data.concern}
                Budget: ${chat.data.budget}
                
                Berikan respon yang empatik dan sarankan untuk mencoba kriteria lain.`
              }]
            });

            response = {
              message: aiResponse.choices[0].message.content,
              options: ["Mulai Konsultasi Baru"]
            };
          } else {
            const productDetails = products.map(p => 
              `${p.name} (${formatPrice(p.price)}): ${p.description}`
            ).join('\n');

            aiResponse = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [{
                role: "system",
                content: `Berikan rekomendasi sunscreen berdasarkan:
                Jenis Kulit: ${chat.data.skinType}
                Masalah: ${chat.data.concern}
                Budget: ${chat.data.budget}
                
                Produk tersedia:
                ${productDetails}
                
                Berikan penjelasan yang informatif dan personal tentang mengapa produk ini cocok untuk pengguna.`
              }]
            });

            response = {
              message: aiResponse.choices[0].message.content,
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
          aiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
              role: "system",
              content: "Terjadi kesalahan. Berikan respon yang meminta pengguna untuk memulai ulang konsultasi dengan cara yang sopan."
            }]
          });

          chat.step = chatFlow.WELCOME;
          response = {
            message: aiResponse.choices[0].message.content,
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