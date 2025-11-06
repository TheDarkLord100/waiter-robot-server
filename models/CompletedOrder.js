// models/CompletedOrder.js
const mongoose = require('mongoose');

const completedOrderSchema = new mongoose.Schema(
  {
    original_order_id: { type: String, required: true },
    table_id: { type: String, required: true },
    order_items: [
      {
        menu_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
      }
    ],
    total: { type: Number, required: true },
    deliveredAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CompletedOrder', completedOrderSchema);
