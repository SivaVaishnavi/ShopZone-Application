const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  banner: { type: String },
  categories: { type: Array, default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
