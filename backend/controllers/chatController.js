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

     const userMessage = message ? message.toLowerCase() : '';

     // Jika tidak ada pesan (pertama kali buka chat)
     if (!message) {
       const welcomeMessage = `
Hai! 👋 Selamat datang di SkinCare Assistant!

Saya adalah chatbot khusus untuk membantu merekomendasikan sunscreen yang tepat untuk kulit Anda. Untuk mendapatkan rekomendasi yang sesuai, Anda perlu memberitahu:

1. Jenis kulit Anda (normal/berminyak/kering)
2. Masalah kulit yang ingin diatasi (jerawat/kusam/kering)

Contoh cara bertanya:
- "Rekomendasi sunscreen untuk kulit berminyak"
- "Produk untuk kulit kering dan kusam"
- "Sunscreen yang cocok untuk kulit berjerawat"

Semua produk yang direkomendasikan dapat langsung dibeli melalui fitur pembelian kami! ✨

Silakan mulai dengan menceritakan kondisi kulit Anda!`;

       responseText = welcomeMessage;
     }
     // Cek jika pesan tidak terkait dengan skincare/produk
     else if (!userMessage.includes('rekomendasi') && 
         !userMessage.includes('produk') && 
         !userMessage.includes('kulit') &&
         !userMessage.includes('sunscreen')) {
       responseText = "Maaf, saya adalah chatbot yang khusus untuk membantu menganalisis kulit dan merekomendasikan produk sunscreen yang sesuai. Silakan tanyakan tentang rekomendasi produk atau konsultasikan kondisi kulit Anda.";
     } 
     // Proses rekomendasi produk
     else {
       let queryParams = { category: 'sunscreen' };

       // Filter berdasarkan jenis kulit
       if (userMessage.includes('kering')) {
         queryParams.skinType = 'kering';
       } else if (userMessage.includes('berminyak')) {
         queryParams.skinType = 'berminyak';
       } else if (userMessage.includes('normal')) {
         queryParams.skinType = 'normal';
       }

       // Filter berdasarkan concern
       if (userMessage.includes('jerawat')) {
         queryParams.concerns = 'jerawat';
       } else if (userMessage.includes('kusam')) {
         queryParams.concerns = 'kusam';
       } else if (userMessage.includes('kering') && !queryParams.skinType) {
         queryParams.concerns = 'kering';
       }

       // Ambil produk yang sesuai filter
       const products = await Product.find(queryParams);
       const limitedProducts = products.slice(0, 3);

       if (limitedProducts.length === 0) {
         responseText = `Maaf, saya belum menemukan produk yang sesuai dengan kriteria Anda.

Mohon berikan informasi yang lebih spesifik tentang:
- Jenis kulit Anda (normal/berminyak/kering)
- Masalah kulit yang ingin diatasi (jerawat/kusam/kering)

Contoh: "Rekomendasi sunscreen untuk kulit berminyak berjerawat"`;
       } else {
         const productList = limitedProducts.map(p => 
           `${p.name} (${formatPrice(p.price)}):\n${p.description}`
         ).join('\n\n');

         const skinType = queryParams.skinType || 'semua jenis kulit';
         const concerns = queryParams.concerns ? ` dengan masalah ${queryParams.concerns}` : '';
         
         const prompt = `Berikan rekomendasi sunscreen untuk ${skinType}${concerns} dari produk berikut:
         ${productList}
         
         Jelaskan dengan gaya yang ramah dan informatif mengapa produk-produk tersebut cocok untuk kondisi kulit yang diminta. Tambahkan informasi bahwa produk dapat langsung dibeli melalui fitur pembelian.`;

         const result = await chatSession.sendMessage(prompt);
         responseText = await result.response.text() + "\n\nSemua produk yang direkomendasikan dapat langsung Anda beli melalui fitur pembelian kami! 🛍️";

         recommendations = {
           sunscreen: limitedProducts.map(p => ({
             id: p._id,
             name: p.name,
             price: formatPrice(p.price),
             description: p.description
           }))
         };
       }
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

module.exports = chatController;