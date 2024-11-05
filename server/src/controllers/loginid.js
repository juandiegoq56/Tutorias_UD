const generateToken = require('../config/auth');
const profesores = require('../../../client/src/Data/profesorIdentificaciones.json');
const admin = require('../../../client/src/Data/adminid.json');
const coordinadores = require('../../../client/src/Data/coordinadorAdmin.json'); // Asegúrate de tener la ruta correcta

exports.login = (req, res) => {
  const { profesorId } = req.body;

  // Convertir profesorId a número
  const profesorIdNum = Number(profesorId);
  console.log(profesorIdNum);

  // Comprobar si el profesor existe en la lista de IDs de profesores
  const profesorExists = profesores.includes(profesorIdNum);
  // Comprobar si el profesor existe en la lista de IDs de administradores
  const adminExists = admin.includes(profesorIdNum);
  // Comprobar si el profesor existe en la lista de IDs de coordinadores
  const coordinadorExists = coordinadores.coordinadores.hasOwnProperty(profesorId);

  if (profesorExists || adminExists || coordinadorExists) {
    const token = generateToken(profesorIdNum); // Generar token si el usuario existe
    let role = 'profesor';

    if (adminExists) {
      role = 'admin';
    } else if (coordinadorExists) {
      role = 'coordinador';
    }

    res.json({ token, role }); // Devolver token y rol
  } else {
    res.status(401).json({ error: 'Sin acceso a la página', profesorId }); // Retornar error si el profesorId no coincide
  }
};
