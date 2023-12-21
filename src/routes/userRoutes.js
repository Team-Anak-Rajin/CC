// src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../authMiddleware');


router.use(authMiddleware);
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.put('/update', userController.updateUser);
router.post('/detail', userController.getDetailUser);

module.exports = router;
