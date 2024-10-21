const axios = require('axios');
const config = require('../config/config');

let cachedToken = null;
let tokenExpiration = null;

// Función para obtener el token de autenticación
const getAuthToken = async () => {
  if (cachedToken && tokenExpiration > Date.now()) {
    return cachedToken;
  }

  try {
    const response = await axios.post(process.env.API_BASE_URL, {
      username: config.API_CREDENTIALS.username,
      password: config.API_CREDENTIALS.password,
      version: "planestic"
    });

    cachedToken = response.data.token;
    tokenExpiration = Date.now() + 3600 * 1000; 

    return cachedToken;
  } catch (error) {
    console.error('Error al obtener el token:', error.message);
    throw error;
  }
};

// Función para obtener datos de la API
exports.fetchData = async (requestBody) => {
  try {
    const token = await getAuthToken();
    const response = await axios.post('https://serviciosoati.portaloas.udistrital.edu.co/odin/gen/apis?api=api_carga_academica&proc=carga_academica', requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos de la API:', error.message);
    throw error;
  }
};
