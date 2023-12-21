const jwt = require('jsonwebtoken');

const secretKey = 'Xck872o@85';

const userData = {
    id_user: '2',
    username: 'user',
};

const token = jwt.sign(userData, secretKey, {
  expiresIn: '100y',
});

console.log('Permanent Token:', token);
