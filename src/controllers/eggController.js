// src/controllers/eggController.js

const db = require('../db');
const fs = require('fs').promises;
const { performObjectDetection } = require('../models/detectEgg');
const path = require('path');
const uploadDir = path.join(__dirname, '..', '..', 'public', 'img', 'egg', 'original');
const saveDir = path.join(__dirname, '..', '..', 'public', 'img', 'egg', 'detect');

exports.getAllEggs = (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const id_user = req.user.id_user;

    db.query('SELECT * FROM eggs WHERE id_user = ?', [id_user], (err, result) => {
      if (err) {
        throw new Error(err.message);
      }

      res.json({ status: 'success', data: result });
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.createEgg = (req, res) => {
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
      'INSERT INTO eggs (id_user, image, detectName, numDetected, up_time) VALUES (?, ?, null, null, ?)',
      [id_user, imageName, up_time],
      (err) => {
        if (err) {
          throw new Error(err.message);
        }

        res.json({ status: 'success', message: 'Egg created successfully', imageName });
      }
    );
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getIdEgg = async (req, res) => {
  try {
    const imgName = req.params.imgName;

    db.query('SELECT id_egg FROM eggs WHERE image = ?', [imgName], async (err, result) => {
      if (err) {
        throw new Error(err.message);
      }

      if (result.length > 0) {
        const id_egg = result[0].id_egg; // Menggunakan id_egg, bukan id_target
        console.error(id_egg);
        res.json({ status: 'success', message: 'Get id successfully', id: id_egg });
      } else {
        res.status(404).json({ status: 'error', message: 'Image not found' });
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};



exports.updateEgg = async (req, res) => {
  try {
    const eggId = req.params.id_egg;

    const result = await new Promise((resolve, reject) => {
      db.query('SELECT image FROM eggs WHERE id_egg = ?', [eggId], (err, result) => {
        if (err) {
          reject(new Error(err.message));
          return;
        }
  
        resolve(result);
      });
    });
  
    if (!result || !result.length) {
      return res.status(404).json({ status: 'error', message: 'Egg not found' });
    }
  
    const { image } = result[0];

    const imageName = image;
    const imagePath = path.join(uploadDir, imageName);
    const detectionResult = await performObjectDetection(imagePath, saveDir);

    const { resultFileName, totalDetections, classCounts } = detectionResult;
    
    await db.query(
      'UPDATE eggs SET detectName=?, numDetected=? WHERE id_egg=?',
      [resultFileName, totalDetections, eggId]
      );

    res.json({ status: 'success', message: 'Egg updated successfully', totalDetections, resultFileName });

  } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.deleteEgg = async (req, res) => {
  try {
    const eggId = req.params.id_egg;

    db.query('SELECT image, detectName FROM eggs WHERE id_egg = ?', [eggId], async (err, result) => {
      if (err) {
        throw new Error(err.message);
      }

      const { image, detectName } = result[0];

      db.query('DELETE FROM eggs WHERE id_egg = ?', [eggId], async (err) => {
        if (err) {
          throw new Error(`Error deleting egg: ${err.message}`);
        }

        try {
          const originalImagePath = path.join(uploadDir, image);
          await fs.unlink(originalImagePath);

          const detectImagePath = path.join(saveDir, detectName);
          await fs.unlink(detectImagePath);

          res.json({ status: 'success', message: 'Egg deleted successfully' });
        } catch (error) {
          throw new Error(`Error deleting egg: ${error.message}`);
        }
      });
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

