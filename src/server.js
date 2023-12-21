// src/server.js

require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const PORT = process.env.NODE_PORT || 3000;

const authMiddleware = require('./authMiddleware');

const userRoutes = require('./routes/userRoutes');

const eggRoutes = require('./routes/eggRoutes');
const coinRoutes = require('./routes/coinRoutes');
const canRoutes = require('./routes/canRoutes');

const placeRoutes = require('./routes/placeRoutes');

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});


app.use('/public/eggs/original', authMiddleware, express.static(path.join(__dirname, '../public', 'img', 'egg', 'original')));
app.use('/public/eggs/detect', authMiddleware, express.static(path.join(__dirname, '../public', 'img', 'egg', 'detect')));

app.use('/public/coins/original', authMiddleware, express.static(path.join(__dirname, '../public', 'img', 'coin', 'original')));
app.use('/public/coins/detect', authMiddleware, express.static(path.join(__dirname, '../public', 'img', 'coin', 'detect')));

app.use('/public/cans/original', authMiddleware, express.static(path.join(__dirname, '../public', 'img', 'can', 'original')));
app.use('/public/cans/detect', authMiddleware, express.static(path.join(__dirname, '../public', 'img', 'can', 'detect')));


app.use('/api', authMiddleware);

app.use('/api/users', userRoutes);

app.use('/api/eggs', eggRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/cans', canRoutes);

app.use('/api/places', placeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
