// src/routes/canRoutes.js

const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');

const canController = require('../controllers/canController');
const authMiddleware = require('../authMiddleware');

const storage = multer.diskStorage({
  destination: 'public/img/can/original/',
  filename: (req, file, callback) => {
    callback(null, 'can_' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.use(authMiddleware);
router.get('/:id_can', canController.updateCan);
router.delete('/:id_can', canController.deleteCan);
router.get('', canController.getAllCans);
router.post('', upload.single('image'), canController.createCan);
router.get('/name/:imgName', canController.getIdCan);

module.exports = router;

