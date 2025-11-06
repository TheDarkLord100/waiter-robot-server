const express = require('express');
const router = express.Router();
const MenuController = require('../controllers/menuController');


router.post('/', MenuController.createMenuItem);
router.get('/', MenuController.listMenuItems);
router.get('/:id', MenuController.getMenuItem);
router.delete('/:id', MenuController.deleteMenuItem);

module.exports = router;