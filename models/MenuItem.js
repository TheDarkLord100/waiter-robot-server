const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({

  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, default: 0, min: 0 },
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
