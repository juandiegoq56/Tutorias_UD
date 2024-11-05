const connection = require('../config/db'); 
const coordinadores = require('../../../client/src/Data/coordinadorAdmin.json');
exports.getTutoring = (req, res) => {
    const sql = `
    SELECT ti.tutoriaId,ti.estudianteCod, T.titulo,T.link_reunion,T.sede_salon,T.descripcion,
    T.fecha,T.horaInicio,T.horaFin,CONCAT(E.nombre, ' ', E.apellido) AS estudiante,m.nombre AS asignatura,
    m.facultad,m.proyecto,T.grupo,CONCAT(p.nombre, ' ', p.apellido) AS profesor
    FROM tutoriasestudiantes ti
    JOIN TUTORIAS T ON ti.tutoriaId = T.id
    JOIN ESTUDIANTES E ON ti.estudianteCod = E.codigo
    JOIN materias m ON T.materiaCod = m.codigo
    JOIN profesores p ON T.profesorCod = p.codigo
  `;
  connection.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
}

exports.getTutoringProfesor = (req, res) => {
  // Obtener el profesorId de los parámetros de la solicitud
  const { profesorId } = req.query;

  // Verificar si se proporcionó el profesorId
  if (!profesorId) {
      return res.status(400).json({ error: 'Se requiere el profesorId' });
  }

  const sql = `
  SELECT ti.tutoriaId, ti.estudianteCod, T.titulo,T.descripcion,
  T.fecha, T.horaInicio, T.horaFin, CONCAT(E.nombre, ' ', E.apellido) AS estudiante, 
  m.nombre AS asignatura, m.facultad, m.proyecto, T.grupo, 
  CONCAT(p.nombre, ' ', p.apellido) AS profesor
  FROM tutoriasestudiantes ti
  JOIN TUTORIAS T ON ti.tutoriaId = T.id
  JOIN ESTUDIANTES E ON ti.estudianteCod = E.codigo
  JOIN materias m ON T.materiaCod = m.codigo
  JOIN profesores p ON T.profesorCod = p.codigo
  WHERE T.profesorCod = ?
`;

  // Ejecutar la consulta con el profesorId como parámetro
  connection.query(sql, [profesorId], (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error al obtener las tutorías' });
      }
      res.json(results);
  });
}

exports.getTutoringCoordinador = (req, res) => {
  const { coordinadorId } = req.query;

  if (!coordinadorId) {
    return res.status(400).json({ error: 'Se requiere el ID del coordinador' });
  }

  // Buscar el proyecto del coordinador
  const proyecto = coordinadores.coordinadores[coordinadorId]?.proyecto;

  if (!proyecto) {
    return res.status(404).json({ error: 'Coordinador no encontrado',coordinadorId });
  }

  // Consulta SQL para obtener las tutorías del proyecto
  const sql = `
    SELECT ti.tutoriaId, ti.estudianteCod, T.titulo, T.descripcion,T.link_reunion,T.sede_salon,
    T.fecha, T.horaInicio, T.horaFin, CONCAT(E.nombre, ' ', E.apellido) AS estudiante, 
    m.nombre AS asignatura, m.facultad, m.proyecto, T.grupo, 
    CONCAT(p.nombre, ' ', p.apellido) AS profesor
    FROM tutoriasestudiantes ti
    JOIN TUTORIAS T ON ti.tutoriaId = T.id
    JOIN ESTUDIANTES E ON ti.estudianteCod = E.codigo
    JOIN materias m ON T.materiaCod = m.codigo
    JOIN profesores p ON T.profesorCod = p.codigo
    WHERE m.proyecto = ?
  `;

  connection.query(sql, [proyecto], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al obtener las tutorías' });
    }
    res.json(results);
    console.log(proyecto)
  });
}