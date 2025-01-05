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
       // Parse permintaan user untuk filter
       const userRequest = message.toLowerCase();
       let queryParams = { category: 'sunscreen' };

       // Filter berdasarkan jenis kulit
       if (userRequest.includes('kering')) {
         queryParams.skinType = 'kering';
       } else if (userRequest.includes('berminyak')) {
         queryParams.skinType = 'berminyak';
       } else if (userRequest.includes('normal')) {
         queryParams.skinType = 'normal';
       }

       // Filter berdasarkan concern
       if (userRequest.includes('jerawat')) {
         queryParams.concerns = 'jerawat';
       } else if (userRequest.includes('kusam')) {
         queryParams.concerns = 'kusam';
       } else if (userRequest.includes('kering') && !queryParams.skinType) {
         queryParams.concerns = 'kering';
       }

       // Ambil produk yang sesuai filter
       const products = await Product.find(queryParams);
       
       // Batasi jumlah rekomendasi
       const limitedProducts = products.slice(0, 3);

       if (limitedProducts.length === 0) {
         responseText = "Maaf, saya tidak menemukan produk yang sesuai dengan kriteria Anda. Mohon coba kriteria lain atau tanyakan tentang jenis produk lainnya.";
       } else {
         const productList = limitedProducts.map(p => 
           `${p.name} (${formatPrice(p.price)}):\n${p.description}`
         ).join('\n\n');

         const skinType = queryParams.skinType || 'semua jenis kulit';
         const concerns = queryParams.concerns ? ` dengan masalah ${queryParams.concerns}` : '';
         
         const prompt = `Berikan rekomendasi sunscreen untuk ${skinType}${concerns} dari produk berikut:
         ${productList}
         
         Jelaskan dengan gaya yang ramah dan informatif mengapa produk-produk tersebut cocok untuk kondisi kulit yang diminta. Sertakan informasi tentang keunggulan setiap produk.`;

         const result = await chatSession.sendMessage(prompt);
         responseText = await result.response.text();

         recommendations = {
           sunscreen: limitedProducts.map(p => ({
             name: p.name,
             price: formatPrice(p.price),
             description: p.description
           }))
         };
       }
     } else {
       // Untuk pesan umum lainnya
       const result = await chatSession.sendMessage(message || "Perkenalkan dirimu sebagai asisten skincare yang ramah dan berikan sapaan hangat.");
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