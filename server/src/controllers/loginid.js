// controllers/authController.js
const generateToken = require('../config/auth');
const profesores = require('../../../client/src/Data/profesorIdentificaciones.json');
const admin = require('../../../client/src/Data/adminid.json');

exports.login = (req, res) => {
  const { profesorId } = req.body;

  // Convertir profesorId a número
  const profesorIdNum = Number(profesorId);
  console.log(profesorIdNum)
  // Comprobar si el profesor existe en la lista de IDs de profesores
  const profesorExists = profesores.includes(profesorIdNum);
  // Comprobar si el profesor existe en la lista de IDs de administradores
  const adminExists = admin.includes(profesorIdNum);

  if (profesorExists || adminExists) {
    const token = generateToken(profesorIdNum); // Generar token si el usuario existe
    const role = profesorExists ? 'profesor' : 'admin'; // Determinar el rol
    res.json({ token, role }); // Devolver token y rol
  } else {
    res.status(401).json({ error: 'Sin acceso a la página', profesorId }); // Retornar error si el profesorId no coincide
  }
};
