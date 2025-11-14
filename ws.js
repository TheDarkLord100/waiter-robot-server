const WebSocket = require("ws");

let robot1Socket = null;
let robot2Socket = null;

function initWebSocket(server) {
  const wss = new WebSocket.Server({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    if (req.url === "/robot1") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        console.log("Robot 1 connected!");
        robot1Socket = ws;
        ws.on("close", () => {
          console.log("Robot 1 disconnected");
          robot1Socket = null;
        });
      });
    } else if (req.url === "/robot2") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        console.log("Robot 2 connected!");
        robot2Socket = ws;
        ws.on("close", () => {
          console.log("Robot 2 disconnected");
          robot2Socket = null;
        });
      });
    } else {
      socket.destroy();
    }
  });

  console.log("WebSocket routing enabled: /robot1 & /robot2");
}

function sendToRobot(robotId, message) {
  const msg = JSON.stringify(message);

  if (robotId === "robot1" && robot1Socket) {
    robot1Socket.send(msg);
  }
  if (robotId === "robot2" && robot2Socket) {
    robot2Socket.send(msg);
  }
}

module.exports = { initWebSocket, sendToRobot };
