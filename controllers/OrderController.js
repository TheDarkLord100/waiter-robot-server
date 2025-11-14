const mongoose = require('mongoose');
const Order = require('../models/Order');
const Robot = require('../models/Robot');
const CompletedOrder = require('../models/CompletedOrder');
const MenuItem = require('../models/MenuItem');
const { emitOrderUpdate, emitRobotUpdate } = require('../ws');

const createAwaitingOrder = async (req, res) => {
  try {
    const { table_id } = req.params;


    const order = new Order({
      table_id,
      order_status: 'AWAITING',
      order_items: [],
      total: 0
    });

    const freeRobot = await Robot.findOne({ state: 'IDLE' });
    if (freeRobot) {
      freeRobot.state = 'GOING';
      freeRobot.current_order_id = order._id;
      await freeRobot.save();

      order.order_status = 'ONGOING';
      order.assigned_robot_id = freeRobot._id;
      await order.save();

      emitRobotUpdate(freeRobot);
      emitOrderUpdate(order);

      return res.json({
        message: "Order created and robot assigned successfully",
        order_id: order._id,
        assigned_robot_id: freeRobot.robot_id
      });
    }
    await order.save();
    emitOrderUpdate(order);
    return res.json({
      message: "Order created and queued",
      order_id: order._id,
      assigned_robot: null
    });
  } catch (err) {
    console.error('Error creating order', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const placeOrder = async (req, res) => {
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

    emitOrderUpdate(order);

    const robot = await Robot.findById(order.assigned_robot_id);

    if (robot) {
      robot.state = "RETURNING";
      await robot.save();
      emitRobotUpdate(robot);
    }

    return res.json({
      message: "Order placed successfully"
    });
  } catch (err) {
    console.error('addItemsAndPlaceOrder error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const sendForPickup = async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await Order.findById(order_id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.order_status = "PICKUP";
    await order.save();
    emitOrderUpdate(order);

    const freeRobot = await Robot.findOne({ state: "IDLE" });

    if (freeRobot) {
      freeRobot.state = "GOING";
      freeRobot.current_order_id = order._id;
      await freeRobot.save();

      order.assigned_robot_id = freeRobot._id;
      order.order_status = "DELIVERING";
      await order.save();

      emitRobotUpdate(freeRobot);
      emitOrderUpdate(order);

      return res.json({
        message: "Order ready and assigned for pickup",
        robot: freeRobot.robot_id
      });
    }

    return res.json({
      message: "Order ready for pickup and waiting in queue",
      robot: null
    });
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

    const robot = await Robot.findById(order.assigned_robot_id).session(session);
    if (!robot) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "No robot assigned to this order" });
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

    robot.state = "RETURNING";
    robot.current_order_id = null;
    await robot.save({ session });

    await session.commitTransaction();
    session.endSession();

    emitRobotUpdate(robot);

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
  placeOrder,
  sendForPickup,
  markDeliveredAndArchive,
};