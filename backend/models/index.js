const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'sunscreen' 
  },
  skinType: {
    type: String,
    required: true,
    enum: ['normal', 'berminyak', 'kering']
  },
  price: {
    type: Number,
    required: true
  },
  description: String,
  concerns: [{
    type: String,
    enum: ['jerawat', 'kusam', 'kering', 'normal']
  }]
}, {
  timestamps: true
});

productSchema.index({ skinType: 1, price: 1, concerns: 1 });

// Chat Schema
const chatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  step: {
    type: Number,
    default: 0
  },
  data: {
    skinType: String,
    concern: String,
    budget: String
  },
  messages: [{
    type: {
      type: String,
      enum: ['user', 'bot']
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Payment Schema (tambahan baru)
const paymentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['SOL', 'USDT'],
    default: 'SOL'
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentId: String,
  walletAddress: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

const transactionSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  },
  paymentId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['SOL', 'USDT'],
    default: 'SOL'
  },
  productName: String,
  buyerName: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Pre-save hook untuk hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Methods
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

module.exports = { Product, Chat, User, Payment, Transaction };