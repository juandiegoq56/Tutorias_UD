const allOrganizedData = require('../../../client/src/Data/allOrganizedData.json');
const connection = require('../config/db'); 

exports.createTutoring = (req, res) => {
  const formData = req.body;
  let codigoProfesor = null;
  let codigoAsignatura = null;
  let estudiantes = formData.estudiantes;

  function nombreApellido(nombreCompleto) {
    const partes = nombreCompleto.trim().split(/\s+/);
    let nombres = '';
    let apellidos = '';
  
    if (partes.length > 2) {
      apellidos = partes.slice(0, 2).join(" ");
      nombres = partes.slice(2).join(" ");
    } else if (partes.length === 2) {
      apellidos = partes[0];
      nombres = partes[1];
    } else {
      return { nombres: nombreCompleto, apellidos: '' };
    }
  
    return {
      nombres: nombres.toUpperCase(),
      apellidos: apellidos.toUpperCase()
    };
  }

  const tutorNombre = formData.tutor_tutoring.trim().toUpperCase();
  const { apellidos, nombres } = nombreApellido(formData.tutor_tutoring.trim().toUpperCase());
  const asignaturaNombre = formData.asignatura_tutoring.trim().toUpperCase();
  const grupoNombre = formData.grupo_tutoring.trim();
  
  console.log(`Buscando tutor: ${tutorNombre}, asignatura: ${asignaturaNombre}, grupo: ${grupoNombre}`);

  // Buscar el profesor y la asignatura en allOrganizedData
  for (const profesorKey in allOrganizedData) {
    if (profesorKey.toUpperCase().includes(tutorNombre)) {
      console.log(`Profesor encontrado: ${profesorKey}`);
      const profesorData = allOrganizedData[profesorKey];

      for (const asignaturaKey in profesorData) {
        if (asignaturaKey.toUpperCase() === asignaturaNombre) {
          console.log(`Asignatura encontrada: ${asignaturaKey}`);
          const grupoData = profesorData[asignaturaKey][grupoNombre];

          if (grupoData) {
            codigoProfesor = profesorKey.split(" - ")[0];
            codigoAsignatura = grupoData.COD_ESPACIO;
            console.log(`Datos encontrados: Profesor ${codigoProfesor}, Asignatura ${codigoAsignatura}`);
            break;
          } else {
            console.log(`No se encontró el grupo ${grupoNombre} para la asignatura ${asignaturaNombre}`);
          }
        }
      }
    }
  }

  if (codigoProfesor && codigoAsignatura) {
    connection.beginTransaction((err) => {
      if (err) throw err;

      const checkMateriaQuery = `SELECT 1 FROM materias WHERE codigo = ?`;
      connection.query(checkMateriaQuery, [codigoAsignatura], (err, results) => {
        if (err) return connection.rollback(() => { throw err; });

        const insertMateria = () => {
          return new Promise((resolve, reject) => {
            if (results.length === 0) {
              const materiaQuery = `INSERT INTO materias (nombre, codigo, facultad, proyecto) VALUES (?, ?, ?, ?)`;
              connection.query(materiaQuery, [asignaturaNombre, codigoAsignatura, formData.facultad_tutoring, formData.proyecto_tutoring], (err, result) => {
                if (err) return reject(err);
                resolve();
              });
            } else {
              resolve();
            }
          });
        };

        const insertProfesor = () => {
          return new Promise((resolve, reject) => {
            const profesorQuery = `INSERT INTO profesores (codigo, nombre, apellido) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), apellido=VALUES(apellido)`;
            connection.query(profesorQuery, [codigoProfesor, nombres, apellidos], (err, result) => {
              if (err) return reject(err);
              resolve();
            });
          });
        };

        const insertTutoria = () => {
          return new Promise((resolve, reject) => {
            const linkTutoring = formData.link_tutoring || "N/A";
            const salonTutoring = formData.salon_tutoring || "N/A";
            const tutoriaQuery = `INSERT INTO tutorias (titulo, fecha, horainicio, horafin, profesorcod, materiacod, sede_salon, link_reunion, grupo, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            connection.query(tutoriaQuery, [formData.name_tutoring, formData.fecha_tutoring, formData.hora_inicio, formData.hora_fin, codigoProfesor, codigoAsignatura, salonTutoring, linkTutoring, grupoNombre, formData.descripcion_tutoring], (err, result) => {
              if (err) return reject(err);
              resolve(result.insertId);
            });
          });
        };

        const insertEstudiantes = (tutoriaid) => {
          const promises = estudiantes.map(estudiante => {
            return new Promise((resolve, reject) => {
              const estudianteNombres = estudiante.ESTUDIANTE.split(' ').slice(2).join(' ');
              const estudianteApellidos = estudiante.ESTUDIANTE.split(' ').slice(0, 2).join(' ');
        
              const checkEstudianteQuery = `SELECT 1 FROM estudiantes WHERE codigo = ?`;
              connection.query(checkEstudianteQuery, [estudiante.COD_ESTUDIANTE], (err, results) => {
                if (err) return reject(err);
        
                const insertOrUpdateEstudiante = () => {
                  return new Promise((resolveInsert, rejectInsert) => {
                    if (results.length === 0) {
                      const estudianteQuery = `INSERT INTO estudiantes (codigo, nombre, apellido) VALUES (?, ?, ?)`;
                      connection.query(estudianteQuery, [estudiante.COD_ESTUDIANTE, estudianteNombres, estudianteApellidos], (err, result) => {
                        if (err) return rejectInsert(err);
                        resolveInsert();
                      });
                    } else {
                      resolveInsert();
                    }
                  });
                };
        
                insertOrUpdateEstudiante().then(() => {
                  const tutoriaEstudianteQuery = `INSERT INTO tutoriasestudiantes (tutoriaid, estudiantecod) VALUES (?, ?)`;
                  connection.query(tutoriaEstudianteQuery, [tutoriaid, estudiante.COD_ESTUDIANTE], (err, result) => {
                    if (err) return reject(err);
                    resolve();
                  });
                }).catch(reject);
              });
            });
          });
        
          return Promise.all(promises);
        };

        const executeInserts = async () => {
          try {
            await insertMateria();
            await insertProfesor();
            const tutoriaid = await insertTutoria();
            await insertEstudiantes(tutoriaid);
            connection.commit((err) => {
              if (err) return connection.rollback(() => { throw err; });
              res.json({ message: 'Datos insertados correctamente' });
            });
          } catch (error) {
            connection.rollback(() => { throw error; });
          }
        };

        executeInserts();
      });
    });
  } else {
    res.status(404).json({ error: "No se encontraron los datos para la tutoría solicitada." });
  }
};
exports.updateTutoring = (req, res) => {
  const tutoriaid = req.params.id;
  const formData = req.body;
  let codigoProfesor = null;
  let codigoAsignatura = null;
  let estudiantes = formData.estudiantes;

  function nombreApellido(nombreCompleto) {
    const partes = nombreCompleto.trim().split(/\s+/);
    let nombres = '';
    let apellidos = '';

    if (partes.length > 2) {
      apellidos = partes.slice(0, 2).join(" ");
      nombres = partes.slice(2).join(" ");
    } else if (partes.length === 2) {
      apellidos = partes[0];
      nombres = partes[1];
    } else {
      return { nombres: nombreCompleto, apellidos: '' };
    }

    return {
      nombres: nombres.toUpperCase(),
      apellidos: apellidos.toUpperCase()
    };
  }

  const tutorNombre = formData.tutor_tutoring.trim().toUpperCase();
  const { apellidos, nombres } = nombreApellido(formData.tutor_tutoring.trim().toUpperCase());
  const asignaturaNombre = formData.asignatura_tutoring.trim().toUpperCase();
  const grupoNombre = formData.grupo_tutoring.trim();

  console.log(`Buscando tutor: ${tutorNombre}, asignatura: ${asignaturaNombre}, grupo: ${grupoNombre}`);

  for (const profesorKey in allOrganizedData) {
    if (profesorKey.toUpperCase().includes(tutorNombre)) {
      const profesorData = allOrganizedData[profesorKey];

      for (const asignaturaKey in profesorData) {
        if (asignaturaKey.toUpperCase() === asignaturaNombre) {
          const grupoData = profesorData[asignaturaKey][grupoNombre];

          if (grupoData) {
            codigoProfesor = profesorKey.split(" - ")[0];
            codigoAsignatura = grupoData.COD_ESPACIO;
            break;
          }
        }
      }
    }
  }

  if (codigoProfesor && codigoAsignatura) {
    connection.beginTransaction((err) => {
      if (err) throw err;

      const updateMateria = () => {
        return new Promise((resolve, reject) => {
          const materiaQuery = `
            INSERT INTO materias (nombre, codigo, facultad, proyecto)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), facultad=VALUES(facultad), proyecto=VALUES(proyecto)
          `;
          connection.query(materiaQuery, [asignaturaNombre, codigoAsignatura, formData.facultad_tutoring, formData.proyecto_tutoring], (err, result) => {
            if (err) return reject(err);
            resolve();
          });
        });
      };

      const updateProfesor = () => {
        return new Promise((resolve, reject) => {
          const profesorQuery = `
            INSERT INTO profesores (codigo, nombre, apellido)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), apellido=VALUES(apellido)
          `;
          connection.query(profesorQuery, [codigoProfesor, nombres, apellidos], (err, result) => {
            if (err) return reject(err);
            resolve();
          });
        });
      };

      const updateTutoria = () => {
        return new Promise((resolve, reject) => {
          const linkTutoring = formData.link_tutoring || "N/A";
          const salonTutoring = formData.salon_tutoring || "N/A";
          const tutoriaQuery = `
            UPDATE tutorias
            SET titulo = ?, fecha = ?, horainicio = ?, horafin = ?, profesorcod = ?, materiacod = ?, sede_salon = ?, link_reunion = ?, grupo = ?, descripcion = ?
            WHERE id = ?
          `;
          connection.query(tutoriaQuery, [
            formData.name_tutoring,
            formData.fecha_tutoring,
            formData.hora_inicio,
            formData.hora_fin,
            codigoProfesor,
            codigoAsignatura,
            salonTutoring,
            linkTutoring,
            grupoNombre,
            formData.descripcion_tutoring,
            tutoriaid
          ], (err, result) => {
            if (err) return reject(err);
            resolve();
          });
        });
      };

      const updateEstudiantes = () => {
        return new Promise((resolve, reject) => {
          const deleteSql = 'DELETE FROM tutoriasestudiantes WHERE tutoriaid = ?';
          connection.query(deleteSql, [tutoriaid], (err) => {
            if (err) return reject(err);

            const promises = estudiantes.map(estudiante => {
              return new Promise((resolveEstudiante, rejectEstudiante) => {
                const estudianteNombres = estudiante.ESTUDIANTE.split(' ').slice(2).join(' ');
                const estudianteApellidos = estudiante.ESTUDIANTE.split(' ').slice(0, 2).join(' ');

                const checkEstudianteQuery = `SELECT 1 FROM estudiantes WHERE codigo = ?`;
                connection.query(checkEstudianteQuery, [estudiante.COD_ESTUDIANTE], (err, results) => {
                  if (err) return rejectEstudiante(err);

                  const insertOrUpdateEstudiante = () => {
                    return new Promise((resolveInsert, rejectInsert) => {
                      if (results.length === 0) {
                        const estudianteQuery = `INSERT INTO estudiantes (codigo, nombre, apellido) VALUES (?, ?, ?)`;
                        connection.query(estudianteQuery, [estudiante.COD_ESTUDIANTE, estudianteNombres, estudianteApellidos], (err, result) => {
                          if (err) return rejectInsert(err);
                          resolveInsert();
                        });
                      } else {
                        resolveInsert();
                      }
                    });
                  };

                  insertOrUpdateEstudiante().then(() => {
                    const tutoriaEstudianteQuery = `INSERT INTO tutoriasestudiantes (tutoriaid, estudiantecod) VALUES (?, ?)`;
                    connection.query(tutoriaEstudianteQuery, [tutoriaid, estudiante.COD_ESTUDIANTE], (err, result) => {
                      if (err) return rejectEstudiante(err);
                      resolveEstudiante();
                    });
                  }).catch(rejectEstudiante);
                });
              });
            });

            Promise.all(promises).then(resolve).catch(reject);
          });
        });
      };

      const executeUpdates = async () => {
        try {
          await updateMateria();
          await updateProfesor();
          await updateTutoria();
          await updateEstudiantes();
          connection.commit((err) => {
            if (err) return connection.rollback(() => { throw err; });
            res.json({ message: 'Tutoría actualizada correctamente' });
          });
        } catch (error) {
          connection.rollback(() => { throw error; });
        }
      };

      executeUpdates();
    });
  } else {
    res.status(404).json({ error: "No se encontraron los datos para la tutoría solicitada." });
  }
};

exports.deleteTutoria = (req, res) => {
  const tutoriaid = req.params.id;

  connection.beginTransaction((err) => {
    if (err) {
      console.error('Error al iniciar la transacción:', err);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }

    const deleteFromTutoriasEstudiantes = 'DELETE FROM tutoriasestudiantes WHERE tutoriaid = ?';
    connection.query(deleteFromTutoriasEstudiantes, [tutoriaid], (err, result) => {
      if (err) {
        return connection.rollback(() => {
          console.error('Error al eliminar de tutoriasestudiantes:', err);
          res.status(500).json({ error: 'Error interno del servidor.' });
        });
      }

      const deleteFromTutorias = 'DELETE FROM tutorias WHERE id = ?';
      connection.query(deleteFromTutorias, [tutoriaid], (err, result) => {
        if (err) {
          return connection.rollback(() => {
            console.error('Error al eliminar de tutorias:', err);
            res.status(500).json({ error: 'Error interno del servidor.' });
          });
        }

        if (result.affectedRows === 0) {
          return connection.rollback(() => {
            res.status(404).json({ error: 'Tutoría no encontrada.' });
          });
        }

        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              console.error('Error al confirmar la transacción:', err);
              res.status(500).json({ error: 'Error interno del servidor.' });
            });
          }

          res.status(200).json({ message: 'Tutoría eliminada con éxito.' });
        });
      });
    });
  });
};
