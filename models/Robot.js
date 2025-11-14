const mongoose = require('mongoose');

const RobotSchema = new mongoose.Schema({
    robot_id: {
        type: String,
        required: true,
        unique: true
    },
    state: {
        type: String,
        enum: [
            'IDLE',
            'GOING',
            'WAITING',
            'DELIVERING',
            'RETURNING'
        ],
        default: 'IDLE'
    },
    current_order_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    }
});

module.exports = mongoose.model('Robot', RobotSchema);