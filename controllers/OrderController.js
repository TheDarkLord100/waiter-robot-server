const mongoose = require('mongoose');
const Order = require('../models/Order');
const CompletedOrder = require('../models/CompletedOrder');
const MenuItem = require('../models/MenuItem');

const createAwaitingOrder = async (req, res) => {
    try {
        const { table_id } = req.params;


        const order = new Order({
            table_id,
            order_status: 'AWAITING',
            order_items: [],
            total: 0
        });

        await order.save();
        return res.status(201).json(order);
    } catch (err) {
        console.error('createAwaitingOrder error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

const dispatchAwaitingOrder = async (req, res) => {
    try {
        const { table_id } = req.params;

        const order = await Order.findOneAndUpdate(
            { table_id, order_status: 'AWAITING' },
            { $set: { order_status: 'ONGOING' } },
            { new: true, sort: { createdAt: 1 } }
        );

        if (!order) return res.status(404).json({ error: 'No awaiting order found for this table' });

        return res.json(order);
    } catch (err) {
        console.error('dispatchAwaitingOrder error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

const addItemsAndPlaceOrder = async (req, res) => {
    try {
        const { order_id } = req.params;

        const { order_items } = req.body;
        if (!Array.isArray(order_items) || order_items.length === 0) {
            return res.status(400).json({ error: 'order_items array required' });
        }

        const finalItems = [];
        let total = 0;

        for (const it of order_items) {
            const menu = await MenuItem.findById(it.menu_item_id);
            if (!menu) return res.status(400).json({ error: `Menu item not found: ${it.menu_item_id}` });
            const price = Number(menu.price || 0);
            finalItems.push({
                menu_item_id: menu._id,
                name: menu.name,
                price,
                quantity: qty
            });
            total += price * qty;
        }

        const order = await Order.findById(order_id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        order.order_items = finalItems;
        order.total = total;
        order.order_status = 'PLACED';
        await order.save();

        return res.json(order);
    } catch (err) {
        console.error('addItemsAndPlaceOrder error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

const sendForPickup = async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await Order.findByIdAndUpdate(order_id, { $set: { order_status: 'PICKUP' } }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    return res.json(order);
  } catch (err) {
    console.error('sendForPickup error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const markDeliveredAndArchive = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { order_id } = req.params;

    const order = await Order.findById(order_id).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Order not found' });
    }

    const completed = new CompletedOrder({
      original_order_id: order._id,
      table_id: order.table_id,
      order_items: order.order_items.map((it) => ({
        menu_item_id: it.menu_item_id,
        name: it.name,
        price: it.price,
        quantity: it.quantity
      })),
      total: order.total,
      deliveredAt: new Date()
    });

    await completed.save({ session });

    await Order.deleteOne({ _id: order._id }).session(session);

    await session.commitTransaction();
    session.endSession();

    return res.json({ message: 'Order delivered and archived', completedOrderId: completed._id });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('markDeliveredAndArchive error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createAwaitingOrder,
  dispatchAwaitingOrder,
  addItemsAndPlaceOrder,
  sendForPickup,
  markDeliveredAndArchive
};