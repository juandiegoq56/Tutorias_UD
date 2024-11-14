const generateToken = require('../config/auth');
const profesores = require('../../../client/src/Data/profesorIdentificaciones.json');
const connection = require('../config/db'); 

exports.login = async (req, res) => {
  try {
    const { profesorId } = req.body;
    const profesorIdNum = Number(profesorId);
    
    connection.execute(
      'SELECT rol FROM rol WHERE identificacion = ?',
      [profesorIdNum],
      (error, roles) => {
        if (error) {
          console.error('Error en la consulta:', error);
          return res.status(500).json({ 
            error: 'Error interno del servidor', 
            message: error.message 
          });
        }

        // Comprobar si el profesor existe en la lista de IDs de profesores
        const profesorExists = profesores.includes(profesorIdNum);
        
        if (profesorExists || roles.length > 0) {
          const token = generateToken(profesorIdNum);
          let role = 'profesor';
          let proyecto = null;

          if (roles.length > 0) {
            const userRole = roles[0];
            
            if (userRole.rol === 1) {
              role = 'admin';
            } else if (userRole.rol === 2) {
              role = 'coordinador';
              proyecto = userRole.proyecto;
            }
          }

          const response = {
            token,
            role,
            ...(proyecto && { proyecto })
          };

          res.json(response);
        } else {
          res.status(401).json({ 
            error: 'Sin acceso a la página', 
            profesorId 
          });
        }
      }
    );

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor', 
      message: error.message 
    });
  }
};
