const express = require('express');
const router = express.Router();

const { robotArrivedAtTable, robotAtHome} = require('../controllers/robotController');

router.post('/:robotId/arrived', robotArrivedAtTable);
router.post('/:robotId/home', robotAtHome);

module.exports = router;