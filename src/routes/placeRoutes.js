// src/routes/placeRoutes.js

const express = require('express');
const router = express.Router();

const placeController = require('../controllers/placeController');
const authMiddleware = require('../authMiddleware');

router.use(authMiddleware);
router.post('/place', placeController.getStore);
router.post('/getNextPlace', placeController.getNextStore);
router.post('/getDetailPlace', placeController.getStoreDetails);

module.exports = router;

