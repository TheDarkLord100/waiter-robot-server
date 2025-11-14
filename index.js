const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const http = require('http');
// const { initWebSocket } = require('./ws');
const { initWebSocket } = require('./ws');

const teleopRoutes = require('./routes/teleopRoutes');


const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const robotRoutes = require('./routes/robotRoutes');

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

dotenv.config();
connectDB();


app.use('/orders', orderRoutes);
app.use('/menu', menuRoutes);
app.use('/robot', robotRoutes);
app.use('/teleop', teleopRoutes);


app.get('/', (req, res) => {
  res.send('API is running...');
});

initWebSocket(server);

const PORT = process.env.PORT || 4000;

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
})