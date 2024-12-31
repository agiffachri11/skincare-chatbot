require('dotenv').config();
const connectDB = require('../config/db');
const { Product } = require('../models');

const products = [
  {
    name: 'Cetaphil Gentle Cleanser',
    category: 'cleanser',
    skinType: 'normal',
    price: 150000,
    description: 'Pembersih wajah lembut untuk kulit normal',
    concerns: ['normal']
  },
  {
    name: 'La Roche Posay Effaclar',
    category: 'cleanser',
    skinType: 'berminyak',
    price: 250000,
    description: 'Pembersih wajah untuk kulit berminyak dan berjerawat',
    concerns: ['jerawat']
  },
  {
    name: 'Hada Labo Hydrating Lotion',
    category: 'moisturizer',
    skinType: 'kering',
    price: 85000,
    description: 'Pelembab ringan dengan kandungan hyaluronic acid',
    concerns: ['kering']
  },
  {
    name: 'Wardah Sunscreen Gel',
    category: 'sunscreen',
    skinType: 'kombinasi',
    price: 45000,
    description: 'Sunscreen gel ringan untuk kulit kombinasi',
    concerns: ['normal']
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    await Product.deleteMany({});
    
    await Product.insertMany(products);
    
    console.log('Database berhasil diisi dengan data awal');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();