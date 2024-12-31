require('dotenv').config();
const connectDB = require('../config/db');
const { Product } = require('../models');

const sunscreens = [
  {
    name: "Biore UV Perfect Face Milk",
    category: "sunscreen",
    skinType: "normal",
    price: 85000, // 0-100rb
    description: "Sunscreen ringan dengan perlindungan dari jerawat",
    concerns: ["jerawat"]
  },
  {
    name: "Skin Aqua UV Moisture Gel",
    category: "sunscreen",
    skinType: "normal",
    price: 150000, // 100-200rb
    description: "Sunscreen gel untuk kulit berjerawat",
    concerns: ["jerawat"]
  },
  {
    name: "La Roche Posay Anthelios Clear Skin",
    category: "sunscreen",
    skinType: "normal",
    price: 350000, // Diatas 200rb
    description: "Sunscreen khusus untuk kulit berjerawat",
    concerns: ["jerawat"]
  },
  {
    name: "Wardah UV Shield",
    category: "sunscreen",
    skinType: "normal",
    price: 75000, // 0-100rb
    description: "Sunscreen dengan vitamin C untuk mencerahkan",
    concerns: ["kusam"]
  },
  {
    name: "Rohto Skin Aqua Tone Up",
    category: "sunscreen",
    skinType: "normal",
    price: 160000, // 100-200rb
    description: "Sunscreen dengan efek mencerahkan",
    concerns: ["kusam"]
  },
  {
    name: "SK-II Atmosphere Airy Light UV",
    category: "sunscreen",
    skinType: "normal",
    price: 450000, // Diatas 200rb
    description: "Sunscreen premium dengan efek brightening",
    concerns: ["kusam"]
  },

  {
    name: "Nivea Sun UV Face Moisture",
    category: "sunscreen",
    skinType: "normal",
    price: 80000, // 0-100rb
    description: "Sunscreen dengan tambahan moisturizer",
    concerns: ["kering"]
  },
  {
    name: "Hada Labo UV Perfect Gel",
    category: "sunscreen",
    skinType: "normal",
    price: 180000, // 100-200rb
    description: "Sunscreen gel dengan hyaluronic acid",
    concerns: ["kering"]
  },
  {
    name: "Tatcha Silken Pore Perfecting Sunscreen",
    category: "sunscreen",
    skinType: "normal",
    price: 550000, // Diatas 200rb
    description: "Sunscreen mewah dengan formula melembabkan",
    concerns: ["kering"]
  },

  // Normal + Tidak ada masalah
  {
    name: "Azarine Hydralight UV",
    category: "sunscreen",
    skinType: "normal",
    price: 65000, // 0-100rb
    description: "Sunscreen ringan untuk penggunaan harian",
    concerns: ["normal"]
  },
  {
    name: "Kanebo Allie UV Gel",
    category: "sunscreen",
    skinType: "normal",
    price: 185000, // 100-200rb
    description: "Sunscreen gel untuk perlindungan optimal",
    concerns: ["normal"]
  },
  {
    name: "Shiseido Ultimate Sun Protector",
    category: "sunscreen",
    skinType: "normal",
    price: 480000, // Diatas 200rb
    description: "Sunscreen premium untuk perlindungan maksimal",
    concerns: ["normal"]
  },
  

{
    name: "Sunplay Skin Aqua Clear White",
    category: "sunscreen",
    skinType: "berminyak",
    price: 65000, // 0-100rb
    description: "Sunscreen ringan untuk kulit berminyak berjerawat",
    concerns: ["jerawat"]
 },
 {
    name: "Innisfree Tone Up No Sebum",
    category: "sunscreen", 
    skinType: "berminyak",
    price: 175000, // 100-200rb
    description: "Sunscreen dengan kontrol minyak untuk jerawat",
    concerns: ["jerawat"]
 },
 {
    name: "Anessa Perfect UV Sunscreen Skincare Milk",
    category: "sunscreen",
    skinType: "berminyak", 
    price: 450000, // Diatas 200rb
    description: "Sunscreen high-end untuk kulit berminyak berjerawat",
    concerns: ["jerawat"]
 },
 
 // Berminyak + Kusam
 {
    name: "Emina Sun Battle SPF 45",
    category: "sunscreen",
    skinType: "berminyak",
    price: 45000, // 0-100rb
    description: "Sunscreen matte finish dengan efek mencerahkan",
    concerns: ["kusam"]
 },
 {
    name: "Some By Mi Truecica Mineral Calming",
    category: "sunscreen",
    skinType: "berminyak",
    price: 150000, // 100-200rb
    description: "Sunscreen mineral untuk kulit kusam berminyak",
    concerns: ["kusam"]
 },
 {
    name: "Dr. Jart+ Every Sun Day Tone Up",
    category: "sunscreen",
    skinType: "berminyak",
    price: 350000, // Diatas 200rb
    description: "Sunscreen premium dengan efek tone up",
    concerns: ["kusam"]
 },
 
 // Berminyak + Kering
 {
    name: "Cosrx Aloe Soothing Sun Cream",
    category: "sunscreen",
    skinType: "berminyak",
    price: 95000, // 0-100rb
    description: "Sunscreen dengan aloe vera untuk hidrasi",
    concerns: ["kering"]
 },
 {
    name: "Kose Suncut UV Perfect Gel",
    category: "sunscreen",
    skinType: "berminyak",
    price: 180000, // 100-200rb
    description: "Sunscreen gel yang melembabkan",
    concerns: ["kering"]
 },
 {
    name: "Sulwhasoo UV Wise Brightening Multi",
    category: "sunscreen",
    skinType: "berminyak",
    price: 580000, // Diatas 200rb
    description: "Sunscreen mewah dengan formula seimbang",
    concerns: ["kering"]
 },
 
 // Berminyak + Normal
 {
    name: "Neutrogena Oil-Free Sunscreen",
    category: "sunscreen",
    skinType: "berminyak",
    price: 89000, // 0-100rb
    description: "Sunscreen bebas minyak untuk pemakaian harian",
    concerns: ["normal"]
 },
 {
    name: "Make P:rem UV Defense Me Blue Ray",
    category: "sunscreen",
    skinType: "berminyak",
    price: 195000, // 100-200rb
    description: "Sunscreen dengan teknologi blue light protection",
    concerns: ["normal"]
 },
 {
    name: "Obagi Sun Shield Matte Premium",
    category: "sunscreen",
    skinType: "berminyak",
    price: 450000, // Diatas 200rb
    description: "Sunscreen premium dengan finish matte",
    concerns: ["normal"]
 },
 
 // KULIT KERING (12 produk)
 // Kering + Jerawat
 {
    name: "Cetaphil UV Light Sunscreen",
    category: "sunscreen",
    skinType: "kering",
    price: 95000, // 0-100rb
    description: "Sunscreen lembut untuk kulit kering berjerawat",
    concerns: ["jerawat"]
 },
 {
    name: "Avene Very High Protection",
    category: "sunscreen",
    skinType: "kering",
    price: 185000, // 100-200rb
    description: "Sunscreen untuk kulit sensitif dan berjerawat",
    concerns: ["jerawat"]
 },
 {
    name: "Lancome UV Expert Youth Shield",
    category: "sunscreen",
    skinType: "kering",
    price: 520000, // Diatas 200rb
    description: "Sunscreen premium untuk kulit kering bermasalah",
    concerns: ["jerawat"]
 },
 
 // Kering + Kusam
 {
    name: "Dear Klairs Soft Airy UV Essence",
    category: "sunscreen",
    skinType: "kering",
    price: 85000, // 0-100rb
    description: "Sunscreen essence untuk kulit kusam",
    concerns: ["kusam"]
 },
 {
    name: "Missha All Around Safe Block",
    category: "sunscreen",
    skinType: "kering",
    price: 168000, // 100-200rb
    description: "Sunscreen dengan formula mencerahkan",
    concerns: ["kusam"]
 },
 {
    name: "Fresh Black Tea Firming Treatment",
    category: "sunscreen",
    skinType: "kering",
    price: 650000, // Diatas 200rb
    description: "Sunscreen premium dengan antioksidan tinggi",
    concerns: ["kusam"]
 },
 
 // Kering + Kering
 {
    name: "Eucerin Sun Creme",
    category: "sunscreen",
    skinType: "kering",
    price: 98000, // 0-100rb
    description: "Sunscreen krim untuk ekstra hidrasi",
    concerns: ["kering"]
 },
 {
    name: "Laneige Watery Sun Cream",
    category: "sunscreen",
    skinType: "kering",
    price: 195000, // 100-200rb
    description: "Sunscreen cream dengan formula melembabkan",
    concerns: ["kering"]
 },
 {
    name: "La Mer The Broad Spectrum SPF",
    category: "sunscreen",
    skinType: "kering",
    price: 850000, // Diatas 200rb
    description: "Sunscreen mewah dengan formula ultra-hydrating",
    concerns: ["kering"]
 },
 
 // Kering + Normal
 {
    name: "The Body Shop Skin Defence",
    category: "sunscreen",
    skinType: "kering",
    price: 89000, // 0-100rb
    description: "Sunscreen dengan vitamin E untuk pemakaian harian",
    concerns: ["normal"]
 },
 {
    name: "Origins A Perfect World SPF 40",
    category: "sunscreen",
    skinType: "kering",
    price: 195000, // 100-200rb
    description: "Sunscreen dengan white tea untuk perlindungan optimal",
    concerns: ["normal"]
 },
 {
    name: "Clarins UV Plus Anti-Pollution",
    category: "sunscreen",
    skinType: "kering",
    price: 485000, // Diatas 200rb
    description: "Sunscreen premium dengan perlindungan ganda",
    concerns: ["normal"]
 }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    await Product.insertMany(sunscreens);
    console.log('Database berhasil diisi dengan data sunscreen');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();