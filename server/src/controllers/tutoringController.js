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

  // Si se encuentra el profesor y la asignatura, proceder con la inserción en la base de datos
  if (codigoProfesor && codigoAsignatura) {
    connection.beginTransaction((err) => {
      if (err) throw err;

      const checkMateriaQuery = `SELECT 1 FROM Materias WHERE codigo = ?`;
      connection.query(checkMateriaQuery, [codigoAsignatura], (err, results) => {
        if (err) return connection.rollback(() => { throw err; });

        // Función para insertar la materia si no existe
        const insertMateria = () => {
          return new Promise((resolve, reject) => {
            if (results.length === 0) {
              const materiaQuery = `INSERT INTO Materias (nombre, codigo, facultad, proyecto) VALUES (?, ?, ?, ?)`;
              connection.query(materiaQuery, [asignaturaNombre, codigoAsignatura, formData.facultad_tutoring, formData.proyecto_tutoring], (err, result) => {
                if (err) return reject(err);
                resolve();
              });
            } else {
              resolve();
            }
          });
        };

        // Función para insertar o actualizar al profesor
        const insertProfesor = () => {
          return new Promise((resolve, reject) => {
            const profesorQuery = `INSERT INTO Profesores (codigo, nombre, apellido) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), apellido=VALUES(apellido)`;
            connection.query(profesorQuery, [codigoProfesor, nombres, apellidos], (err, result) => {
              if (err) return reject(err);
              resolve();
            });
          });
        };

        // Función para insertar la tutoría
        const insertTutoria = () => {
          return new Promise((resolve, reject) => {
            const linkTutoring = formData.link_tutoring || "N/A";
            const salonTutoring = formData.salon_tutoring || "N/A";
            const tutoriaQuery = `INSERT INTO Tutorias (titulo, fecha, horaInicio, horaFin, profesorCod, materiaCod,sede_salon,link_reunion,grupo,descripcion) VALUES (?, ?, ?, ?, ?, ?,?,?,?,?)`;
            connection.query(tutoriaQuery, [formData.name_tutoring, formData.fecha_tutoring, formData.hora_inicio, formData.hora_fin, codigoProfesor, codigoAsignatura,salonTutoring,linkTutoring,grupoNombre,formData.descripcion_tutoring], (err, result) => {
              if (err) return reject(err);
              resolve(result.insertId);
            });
          });
        };

        // Función para insertar los estudiantes y relacionarlos con la tutoría
        const insertEstudiantes = (tutoriaId) => {
          const promises = estudiantes.map(estudiante => {
            return new Promise((resolve, reject) => {
              const estudianteNombres = estudiante.ESTUDIANTE.split(' ').slice(2).join(' ');
              const estudianteApellidos = estudiante.ESTUDIANTE.split(' ').slice(0, 2).join(' ');
        
              // Verificar si el estudiante ya existe en la tabla Estudiantes
              const checkEstudianteQuery = `SELECT 1 FROM Estudiantes WHERE codigo = ?`;
              connection.query(checkEstudianteQuery, [estudiante.COD_ESTUDIANTE], (err, results) => {
                if (err) return reject(err);
        
                // Si el estudiante no existe, lo insertamos
                const insertOrUpdateEstudiante = () => {
                  return new Promise((resolveInsert, rejectInsert) => {
                    if (results.length === 0) {
                      const estudianteQuery = `INSERT INTO Estudiantes (codigo, nombre, apellido) VALUES (?, ?, ?)`;
                      connection.query(estudianteQuery, [estudiante.COD_ESTUDIANTE, estudianteNombres, estudianteApellidos], (err, result) => {
                        if (err) return rejectInsert(err);
                        resolveInsert();
                      });
                    } else {
                      resolveInsert(); // El estudiante ya existe, no es necesario insertar
                    }
                  });
                };
        
                // Insertar al estudiante si no existe, luego crear la relación en TutoriasEstudiantes
                insertOrUpdateEstudiante().then(() => {
                  const tutoriaEstudianteQuery = `INSERT INTO TutoriasEstudiantes (tutoriaId, estudianteCod) VALUES (?, ?)`;
                  connection.query(tutoriaEstudianteQuery, [tutoriaId, estudiante.COD_ESTUDIANTE], (err, result) => {
                    if (err) return reject(err);
                    resolve();
                  });
                }).catch(reject);
              });
            });
          });
        
          return Promise.all(promises);
        };
        

        // Ejecutar las inserciones de manera secuencial
        const executeInserts = async () => {
          try {
            await insertMateria();
            await insertProfesor();
            const tutoriaId = await insertTutoria();
            await insertEstudiantes(tutoriaId);
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
  const tutoriaId = req.params.id; // ID de la tutoría a actualizar
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
            SET titulo = ?, fecha = ?, horaInicio = ?, horaFin = ?, profesorCod = ?, materiaCod = ?, sede_salon = ?, link_reunion = ?, grupo = ?, descripcion = ?
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
            tutoriaId
          ], (err, result) => {
            if (err) return reject(err);
            resolve();
          });
        });
      };

      const updateEstudiantes = () => {
        return new Promise((resolve, reject) => {
          const deleteSql = 'DELETE FROM tutoriasestudiantes WHERE tutoriaId = ?';
          connection.query(deleteSql, [tutoriaId], (err) => {
            if (err) return reject(err);

            const promises = estudiantes.map(estudiante => {
              return new Promise((resolveEstudiante, rejectEstudiante) => {
                const estudianteNombres = estudiante.ESTUDIANTE.split(' ').slice(2).join(' ');
                const estudianteApellidos = estudiante.ESTUDIANTE.split(' ').slice(0, 2).join(' ');

                // Verificar si el estudiante ya existe en la tabla estudiantes
                const checkEstudianteQuery = `SELECT 1 FROM estudiantes WHERE codigo = ?`;
                connection.query(checkEstudianteQuery, [estudiante.COD_ESTUDIANTE], (err, results) => {
                  if (err) return rejectEstudiante(err);

                  // Si el estudiante no existe, lo insertamos
                  const insertOrUpdateEstudiante = () => {
                    return new Promise((resolveInsert, rejectInsert) => {
                      if (results.length === 0) {
                        const estudianteQuery = `INSERT INTO estudiantes (codigo, nombre, apellido) VALUES (?, ?, ?)`;
                        connection.query(estudianteQuery, [estudiante.COD_ESTUDIANTE, estudianteNombres, estudianteApellidos], (err, result) => {
                          if (err) return rejectInsert(err);
                          resolveInsert();
                        });
                      } else {
                        resolveInsert(); // El estudiante ya existe, no es necesario insertar
                      }
                    });
                  };

                  // Insertar al estudiante si no existe, luego crear la relación en tutoriasestudiantes
                  insertOrUpdateEstudiante().then(() => {
                    const tutoriaEstudianteQuery = `INSERT INTO tutoriasestudiantes (tutoriaId, estudianteCod) VALUES (?, ?)`;
                    connection.query(tutoriaEstudianteQuery, [tutoriaId, estudiante.COD_ESTUDIANTE], (err, result) => {
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
  const tutoriaId = req.params.id; 

  connection.beginTransaction((err) => {
    if (err) {
      console.error('Error al iniciar la transacción:', err);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }

    const deleteFromTutoriasEstudiantes = 'DELETE FROM tutoriasestudiantes WHERE tutoriaId = ?';
    connection.query(deleteFromTutoriasEstudiantes, [tutoriaId], (err, result) => {
      if (err) {
        return connection.rollback(() => {
          console.error('Error al eliminar de tutoriasestudiantes:', err);
          res.status(500).json({ error: 'Error interno del servidor.' });
        });
      }

      const deleteFromTutorias = 'DELETE FROM tutorias WHERE id = ?';
      connection.query(deleteFromTutorias, [tutoriaId], (err, result) => {
        if (err) {
          return connection.rollback(() => {
            console.error('Error al eliminar de TUTORIAS:', err);
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

