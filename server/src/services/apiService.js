const axios = require('axios');
const config = require('../config/config');

// Función para obtener el token de autenticación
exports.getAuthToken = async () => {
  try {
    const response = await axios.post(config.API_BASE_URL, {
      username: config.API_CREDENTIALS.username,
      password: config.API_CREDENTIALS.password,
      version: "planestic"
    });
    return response.data.token;
  } catch (error) {
    console.error('Error al obtener el token:', error.message);
    throw error;
  }
};

// Función para obtener datos de la API
exports.fetchData = async (requestBody) => {
  try {
    const token = await this.getAuthToken();
    const response = await axios.post('https://serviciosoati.portaloas.udistrital.edu.co/odin/gen/apis?api=api_espacio_curso&proc=espacios_academicos', requestBody, {
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
