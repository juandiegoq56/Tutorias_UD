const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importa el paquete cors
const tutoringRoutes = require('./routes/tutoringRoutes');

const app = express();

// Configura CORS para permitir todas las peticiones
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Ajusta según tus necesidades
  allowedHeaders: ['Content-Type', 'Authorization'] // Ajusta según los encabezados que uses
}));

app.use(bodyParser.json());

app.use('/api/tutoring', tutoringRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
