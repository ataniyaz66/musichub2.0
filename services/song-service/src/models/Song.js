const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
    },
    album: {
      type: String,
      trim: true,
      default: 'Unknown Album',
    },
    year: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear(),
    },
    genre: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    createdBy: {
      type: String, // user ID from auth-service
      required: true,
    },
    createdByUsername: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Index for search
songSchema.index({ title: 'text', artist: 'text', album: 'text' });

module.exports = mongoose.model('Song', songSchema);