// src/controllers/coinController.js

const db = require('../db');
const fs = require('fs').promises;
const { performObjectDetection } = require('../models/detectCoin');
const path = require('path');
const uploadDir = path.join(__dirname, '..', '..', 'public', 'img', 'coin', 'original');
const saveDir = path.join(__dirname, '..', '..', 'public', 'img', 'coin', 'detect');

exports.getAllCoins = (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const id_user = req.user.id_user;

    db.query('SELECT * FROM coins WHERE id_user = ?', [id_user], (err, result) => {
      if (err) {
        throw new Error(err.message);
      }

      res.json({ status: 'success', data: result });
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.createCoin = (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const id_user = req.user.id_user;
    const { file } = req;

    if (!file) {
      throw new Error('No file uploaded');
    }
    
    const imageName = file ? file.filename : null;
    const getTime = new Date();
    const options = { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };

    const up_time = getTime.toLocaleString('en-US', options).replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+) [APap][Mm]/, '$3-$1-$2 $4:$5:$6');

    db.query(
      'INSERT INTO coins (id_user, image, detectName, numDetected, up_time) VALUES (?, ?, null, null, ?)',
      [id_user, imageName, up_time],
      (err) => {
        if (err) {
          throw new Error(err.message);
        }

        res.json({ status: 'success', message: 'Coin created successfully', imageName });
      }
    );
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getIdCoin = async (req, res) => {
  try {
    const imgName = req.params.imgName;

    db.query('SELECT id_coin FROM coins WHERE image = ?', [imgName], async (err, result) => {
      if (err) {
        throw new Error(err.message);
      }

      if (result.length > 0) {
        const id_coin = result[0].id_coin; // Menggunakan id_coin, bukan id_target
        console.error(id_coin);
        res.json({ status: 'success', message: 'Get id successfully', id: id_coin });
      } else {
        res.status(404).json({ status: 'error', message: 'Image not found' });
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};



exports.updateCoin = async (req, res) => {
  try {
    const coinId = req.params.id_coin;

    const result = await new Promise((resolve, reject) => {
      db.query('SELECT image FROM coins WHERE id_coin = ?', [coinId], (err, result) => {
        if (err) {
          reject(new Error(err.message));
          return;
        }
  
        resolve(result);
      });
    });
  
    if (!result || !result.length) {
      return res.status(404).json({ status: 'error', message: 'Coin not found' });
    }
  
    const { image } = result[0];

    const imageName = image;
    const imagePath = path.join(uploadDir, imageName);
    const detectionResult = await performObjectDetection(imagePath, saveDir);

    const { resultFileName, totalDetections, classCounts } = detectionResult;
    
    await db.query(
      'UPDATE coins SET detectName=?, numDetected=? WHERE id_coin=?',
      [resultFileName, totalDetections, coinId]
      );

    res.json({ status: 'success', message: 'Coin updated successfully', totalDetections, resultFileName });

  } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.deleteCoin = async (req, res) => {
  try {
    const coinId = req.params.id_coin;

    db.query('SELECT image, detectName FROM coins WHERE id_coin = ?', [coinId], async (err, result) => {
      if (err) {
        throw new Error(err.message);
      }

      const { image, detectName } = result[0];

      db.query('DELETE FROM coins WHERE id_coin = ?', [coinId], async (err) => {
        if (err) {
          throw new Error(`Error deleting coin: ${err.message}`);
        }

        try {
          const originalImagePath = path.join(uploadDir, image);
          await fs.unlink(originalImagePath);

          const detectImagePath = path.join(saveDir, detectName);
          await fs.unlink(detectImagePath);

          res.json({ status: 'success', message: 'Coin deleted successfully' });
        } catch (error) {
          throw new Error(`Error deleting coin: ${error.message}`);
        }
      });
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

