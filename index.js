const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
app.use(cors());

const registerRouter = require('./routes/api/register');
const loginRouter = require('./routes/api/login');
const profileRouter = require('./routes/api/profile');
const truckRouter = require('./routes/api/truck');
const loadRouter = require('./routes/api/load');
const orderRouter = require('./routes/api/order');

app.use(morgan('combined'));
app.use(express.json());
app.use('/api', registerRouter);
app.use('/api', loginRouter);
app.use('/api', profileRouter);
app.use('/api', truckRouter);
app.use('/api', loadRouter);
app.use('/api', orderRouter);

const PORT = config.get('port') || 5000;

async function start() {
  try {
    await mongoose.connect(config.get('mongoUri'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    app.listen(PORT, () => console.log(`App has been started on port ${PORT}`));
  } catch (error) {
    console.log('Server error', error.message);
  }
}

start();
