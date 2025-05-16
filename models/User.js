const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

// Password hashing middleware (assuming you already have this)
// ... existing password hashing code ...

const User = mongoose.model('User', userSchema);
module.exports = User;
