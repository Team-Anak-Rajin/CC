// src/authMiddleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  
  if (req.path === '/api/users/register') {
    return next();
  }
  
  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'error', message: 'Unauthorized - Token has expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ status: 'error', message: 'Unauthorized - Invalid token' });
    }
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

module.exports = authMiddleware;
