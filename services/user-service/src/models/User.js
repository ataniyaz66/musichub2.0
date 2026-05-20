const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    authId: {
      type: String,
      required: true,
      unique: true, // ID from auth-service
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    bio: {
      type: String,
      maxlength: 300,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    favoriteGenre: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);