// src/routes/coinRoutes.js

const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');

const coinController = require('../controllers/coinController');
const authMiddleware = require('../authMiddleware');

const storage = multer.diskStorage({
  destination: 'public/img/coin/original/',
  filename: (req, file, callback) => {
    callback(null, 'coin_' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.use(authMiddleware);
router.get('/:id_coin', coinController.updateCoin);
router.delete('/:id_coin', coinController.deleteCoin);
router.get('', coinController.getAllCoins);
router.post('', upload.single('image'), coinController.createCoin);
router.get('/name/:imgName', coinController.getIdCoin);


module.exports = router;

