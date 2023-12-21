// src/controllers/userController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

exports.registerUser = async (req, res) => {
  try {
    const { username, password, name, email, hp } = req.body;

    if (!username || !password || !name || !email || !hp) {
      return res.status(400).json({ status: 'error', message: 'All fields are required' });
    }

    db.query('SELECT * FROM users WHERE username = ? OR email = ? OR hp = ?', [username, email, hp], async (err, result) => {
      if (err) {
        res.status(500).json({ status: 'error', message: err.message });
      } else if (result.length > 0) {
        res.status(400).json({ status: 'error', message: 'Username, email, or phone number already exists' });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10).catch(error => console.error('bcrypt error:', error));

  
        db.query(
          'INSERT INTO users (username, password, name, email, hp, image) VALUES (?, ?, ?, ?, ?, null)',
          [username, hashedPassword, name, email, hp],
          (err, result) => {
            if (err) {
              res.status(500).json({ status: 'error', message: err.message });
            } else {
              res.status(201).json({ status: 'success', message: 'User registered successfully' });
            }
          }
        );
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.loginUser = (req, res) => {
  try {
    console.error(req.body);
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ status: 'error', message: 'All fields are required' });
    }

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, result) => {
      if (err) {
        res.status(500).json({ status: 'error', message: err.message });
      } else if (result.length === 0) {
        res.status(401).json({ status: 'error', message: 'Invalid username or password' });
      } else {
        const isPasswordValid = await bcrypt.compare(password, result[0].password);

        if (isPasswordValid) {
          const token = jwt.sign({ id_user: result[0].id_user, username: result[0].username }, process.env.JWT_SECRET, {
            expiresIn: '12h',
          });

          res.json({ status: 'success', token });
        } else {
          res.status(401).json({ status: 'error', message: 'Invalid username or password' });
        }
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }

};

exports.updateUser = async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const id_user = req.user.id_user;

    const { name, email, hp, password } = req.body;

    if (!password || !name || !email || !hp) {
      return res.status(400).json({ status: 'error', message: 'All fields are required' });
    }

    const getUserQuery = 'SELECT * FROM users WHERE id_user = ?';

    const getUserResult = await new Promise((resolve, reject) => {
      db.query(getUserQuery, [id_user], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });

    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    } else {
      updateFields.push('name = ?');
      updateValues.push(getUserResult.name);
    }

    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    } else {
      updateFields.push('email = ?');
      updateValues.push(getUserResult.email);
    }

    if (hp) {
      updateFields.push('hp = ?');
      updateValues.push(hp);
    } else {
      updateFields.push('hp = ?');
      updateValues.push(getUserResult.hp);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    } else {
      updateFields.push('password = ?');
      updateValues.push(getUserResult.password);
    }

    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id_user = ?`;
    const finalUpdateValues = [...updateValues, id_user];

    db.query(updateQuery, finalUpdateValues, (err, result) => {
      if (err) {
        res.status(500).json({ status: 'error', message: err.message });
      } else {
        if (result.affectedRows > 0) {
          res.json({ status: 'success', message: 'User updated successfully' });
        } else {
          res.status(404).json({ status: 'error', message: 'User not found' });
        }
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getDetailUser = async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const id_user = req.user.id_user;

    const getUserQuery = 'SELECT id_user, username, name, email, hp FROM users WHERE id_user = ?';

    db.query(getUserQuery, [id_user], (err, result) => {
      if (err) {
        res.status(500).json({ status: 'error', message: err.message });
      } else {
        if (result.length > 0) {
          const user = result[0];
          res.json({ status: 'success', user });
        } else {
          res.status(404).json({ status: 'error', message: 'User not found' });
        }
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
};



