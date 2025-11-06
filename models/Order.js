// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        table_id: {
            type: String,
            required: true,
        },
        order_status: {
            type: String,
            enum: ['AWAITING', 'ONGOING', 'PLACED', 'PICKUP'],
            default: 'AWAITING',
        },
        order_items: [
            {
                name: { type: String, required: true },        // name of menu item
                price: { type: Number, required: true, min: 0 }, // price at order time
                quantity: { type: Number, required: true, min: 1, default: 1 },
                menu_item_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'MenuItem',
                    required: true,
                },
            },
        ],
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }
);

module.exports = mongoose.model('Order', orderSchema);
