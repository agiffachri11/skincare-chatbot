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
    required: true,
    enum: ['cleanser', 'moisturizer', 'sunscreen']
  },
  skinType: {
    type: String,
    required: true,
    enum: ['normal', 'berminyak', 'kering', 'kombinasi']
  },
  price: {
    type: Number,
    required: true
  },
  description: String,
  concerns: [{
    type: String,
    enum: ['jerawat', 'kusam', 'pori-pori', 'kering', 'normal', 'berminyak']
  }]
}, {
  timestamps: true
});

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

module.exports = { Product, Chat, User };