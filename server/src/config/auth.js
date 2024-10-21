// backend/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');
function generateToken(profesorId) {
  const payload = { id: profesorId };
  const secret = `${config.clave}`; 
  const options = { expiresIn: '1h' }; 

  return jwt.sign(payload, secret, options);
}

module.exports = generateToken;
