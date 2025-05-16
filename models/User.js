const mongoose = require('mongoose');
const argon2 = require('argon2');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    select: false
  },
  googleId: String,
  displayName: String,
  firstName: String,
  lastName: String,
  profileImage: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Check if user should be admin based on username/email
userSchema.pre('save', function(next) {
  if (
    (this.username === 'Simen' && this.email === 'simenwaerstad2@gmail.com') ||
    this.email === 'simenwaerstad2@gmail.com'
  ) {
    this.role = 'admin';
  }
  next();
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  // Only run this if password was modified
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    // Hash password with argon2
    this.password = await argon2.hash(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
