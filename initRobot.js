// initRobots.js
const Robot = require('./models/Robot');

async function initRobots() {
  const robots = ['R1', 'R2'];

  for (const id of robots) {
    const exists = await Robot.findOne({ robot_id: id });
    if (!exists) {
      await Robot.create({ robot_id: id });
      console.log("Added robot:", id);
    } else {
      console.log("Robot already exists:", id);
    }
  }
}

module.exports = initRobots;
