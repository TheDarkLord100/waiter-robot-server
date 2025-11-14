// ws.js
let io = null;

function initWebSocket(server) {
  const socketIO = require('socket.io');
  io = socketIO(server, {
    cors: {
      origin: "*",     // change this for production
    }
  });

  io.on('connection', (socket) => {
    console.log("client connected:", socket.id);

    socket.on('disconnect', () => {
      console.log("client disconnected:", socket.id);
    });
  });
}

function emitOrderUpdate(order) {
  if (!io) return;
  io.emit("order_updated", {
    order_id: order._id,
    order_status: order.order_status,
    assigned_robot_id: order.assigned_robot_id,
  });
}

function emitRobotUpdate(robot) {
  if (!io) return;
  io.emit("robot_updated", {
    robot_id: robot.robot_id,
    state: robot.state,
    current_order_id: robot.current_order_id,
  });
}

module.exports = { initWebSocket, emitOrderUpdate, emitRobotUpdate };
