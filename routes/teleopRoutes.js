const express = require("express");
const router = express.Router();
const { sendToRobot } = require("../ws");

// Send teleop commands to robot 1
router.post("/robot1", (req, res) => {
  sendToRobot("robot1", req.body);
  res.json({ status: "sent to robot1" });
});

// Send teleop commands to robot 2
router.post("/robot2", (req, res) => {
  sendToRobot("robot2", req.body);
  res.json({ status: "sent to robot2" });
});

module.exports = router;
