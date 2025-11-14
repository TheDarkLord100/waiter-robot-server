const Robot = require('../models/Robot');
const Order = require('../models/Order');
const { emitRobotUpdate, emitOrderUpdate } = require('../ws');

const robotArrivedAtTable = async (req, res) => {
    try {
        const { robotId } = req.params;
        const robot = await Robot.findOne({ robot_id: robotId });
        if (!robot) {
            return res.status(404).json({ message: "Robot not found" });
        }

        if (!robot.current_order_id) {
            return res.status(400).json({ message: "robot has no assigned order" });
        }

        robot.state = "WAITING";
        await robot.save();
        emitRobotUpdate(robot);

        const order = await Order.findById(robot.current_order_id);
        emitOrderUpdate(order);

        return res.json({ message: "robot marked arrived and waiting" });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
}

const robotAtHome = async (req, res) => {
    try {
        const { robotId } = req.params;
        const robot = await Robot.findOne({ robot_id: robotId });
        robot.current_order_id = null;
        robot.state = "IDLE";
        await robot.save();

        emitRobotUpdate(robot);

        return res.json({ message: "Robot reached Home" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "server error"
        });
    }
}

module.exports = {
    robotArrivedAtTable,
    robotAtHome
}