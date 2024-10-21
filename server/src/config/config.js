
require('dotenv').config({ path: '../../.env' });

module.exports = {
  API_BASE_URL: process.env.API_BASE_URL,
  API_CREDENTIALS: {
    username: process.env.API_USERNAME,
    password: process.env.API_PASSWORD
  },
  PORT: process.env.PORT || 3000,
  clave: process.env.clave
};
