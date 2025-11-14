// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orController');

// Create awaiting order for table
router.post('/:table_id', orderController.createAwaitingOrder);

// Dispatch awaiting order for table -> mark ONGOING
router.post('/:table_id/dispatch', orderController.dispatchAwaitingOrder);

// Add items to order and place it
router.post('/:order_id/place', orderController.placeOrder);

// Mark order as PICKUP (send)
router.post('/:order_id/ready', orderController.sendForPickup);

// Mark delivered: archive to completed collection & delete original
router.post('/order/:order_id/delivered', orderController.markDeliveredAndArchive);

module.exports = router;
