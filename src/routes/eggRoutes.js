// src/routes/eggRoutes.js

const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');

const eggController = require('../controllers/eggController');
const authMiddleware = require('../authMiddleware');

const storage = multer.diskStorage({
  destination: 'public/img/egg/original/',
  filename: (req, file, callback) => {
    callback(null, 'egg_' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.use(authMiddleware);
router.get('/:id_egg', eggController.updateEgg);
router.delete('/:id_egg', eggController.deleteEgg);
router.get('', eggController.getAllEggs);
router.post('', upload.single('image'), eggController.createEgg);
router.get('/name/:imgName', eggController.getIdEgg);


module.exports = router;

