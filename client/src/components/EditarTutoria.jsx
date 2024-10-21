
import React, { useState, useEffect, useRef } from 'react';
import data from '../Data/datosEstructurados.json';
import profesoresJson from '../Data/allOrganizedData.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/NuevaTutoria.css';

const EditarTutoria = ({ tutoria, onVolverClick, onTutoriaUpdated = () => {} }) => {
  const [formData, setFormData] = useState({
    name_tutoring: '',
    facultad_tutoring: '',
    proyecto_tutoring: '',
    asignatura_tutoring: '',
    grupo_tutoring: '',
    descripcion_tutoring: '',
    tutor_tutoring: '',
    opcion_horario: '',
    link_tutoring: '',
    salon_tutoring: '',
    fecha_tutoring: '',
    hora_inicio: '',
    hora_fin: ''
  });

  const [facultades, setFacultades] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [linkError, setLinkError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedEstudiantes, setSelectedEstudiantes] = useState([]);
  const initialLoadComplete = useRef(false);

  useEffect(() => {
    if (data) {
      const facultades = Object.keys(data);
      setFacultades(facultades);
    }
  }, []);

  useEffect(() => {
    console.log("Selected Estudiantes:", selectedEstudiantes);
  }, [selectedEstudiantes]);

  function convertirEstudiantes(estudiantes) {
    return estudiantes.map(est => {
      if (est.estudianteCod && est.estudiante) {
        return {
          COD_ESTUDIANTE: Number(est.estudianteCod),
          ESTUDIANTE: est.estudiante.split(' ').reverse().join(' ')
        };
      }
      return est;
    });
  }

  useEffect(() => {
    if (tutoria) {
      const fechaFormateada = new Date(tutoria.fecha).toISOString().split('T')[0];
      let opcionHorario = '';
      let salonTutoring = '';
      let linkTutoring = '';

      if (tutoria.sede_salon && (!tutoria.link_reunion || tutoria.link_reunion === 'N/A')) {
        opcionHorario = "presencial";
        salonTutoring = tutoria.sede_salon;
      } else if (tutoria.link_tutoring && tutoria.link_tutoring !== 'N/A') {
        opcionHorario = "virtual";
        linkTutoring = tutoria.link_reunion;
      }

      setFormData({
        name_tutoring: tutoria.titulo || '',
        facultad_tutoring: tutoria.facultad || '',
        proyecto_tutoring: tutoria.proyecto || '',
        asignatura_tutoring: tutoria.asignatura || '',
        grupo_tutoring: tutoria.grupo || '',
        descripcion_tutoring: tutoria.descripcion || '',
        tutor_tutoring: tutoria.profesor || '',
        opcion_horario: opcionHorario,
        link_tutoring: linkTutoring,
        salon_tutoring: salonTutoring,
        fecha_tutoring: fechaFormateada || '',
        hora_inicio: tutoria.horaInicio || '',
        hora_fin: tutoria.horaFin || ''
      });

      setSelectedEstudiantes(convertirEstudiantes(tutoria.estudiantes) || []);
      initialLoadComplete.current = true; // Marcar la carga inicial como completa
    }
  }, [tutoria]);

  const handleFilterChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Si la carga inicial ya ha ocurrido y se cambia un filtro relevante, limpiar los estudiantes seleccionados
    if (initialLoadComplete.current && (name === 'proyecto_tutoring' || name === 'asignatura_tutoring' || name === 'grupo_tutoring')) {
      setSelectedEstudiantes([]);
    }
  };

  useEffect(() => {
    if (formData.facultad_tutoring) {
      const proyectos = Object.keys(data[formData.facultad_tutoring] || {});
      setProyectos(proyectos);
      setAsignaturas([]);
      setGrupos([]);
      setProfesores([]);
    }
  }, [formData.facultad_tutoring]);

  useEffect(() => {
    if (formData.proyecto_tutoring) {
      const asignaturas = Object.keys(data[formData.facultad_tutoring]?.[formData.proyecto_tutoring] || {});
      setAsignaturas(asignaturas);
      setGrupos([]);
      setProfesores([]);
      setEstudiantes([]);
    }
  }, [formData.proyecto_tutoring]);

  useEffect(() => {
    if (formData.asignatura_tutoring) {
      const gruposData = data[formData.facultad_tutoring]?.[formData.proyecto_tutoring]?.[formData.asignatura_tutoring] || [];
      const grupos = gruposData.map((item) => item.grupo);
      setGrupos(grupos);
      setProfesores([]);
      setEstudiantes([]);
    }
  }, [formData.asignatura_tutoring]);

  useEffect(() => {
    const gruposData = data[formData.facultad_tutoring]?.[formData.proyecto_tutoring]?.[formData.asignatura_tutoring] || [];
    const grupoSeleccionado = gruposData.find((item) => item.grupo === formData.grupo_tutoring);
    if (grupoSeleccionado) {
      const profesorDocumento = grupoSeleccionado.documento;
      const profesorKey = Object.keys(profesoresJson).find(key => {
        const [doc] = key.split(' - ');
        return parseInt(doc) === profesorDocumento;
      });

      if (profesorKey) {
        const profesorNombre = profesorKey.split(' - ')[1];
        setProfesores([profesorNombre]);
        setFormData(prev => ({ ...prev, tutor_tutoring: profesorNombre }));
        const grupoProfesorData = profesoresJson[profesorKey]?.[formData.asignatura_tutoring]?.[formData.grupo_tutoring];
        const estudiantesData = grupoProfesorData?.ESTUDIANTES || [];
        setEstudiantes(estudiantesData);
      }
    }
  }, [formData.grupo_tutoring]);

  const handleEstudianteChange = (estudiante) => {
    setSelectedEstudiantes(prevSelected => {
      const isSelected = prevSelected.some(e => e.COD_ESTUDIANTE === estudiante.COD_ESTUDIANTE);
      return isSelected
        ? prevSelected.filter(e => e.COD_ESTUDIANTE !== estudiante.COD_ESTUDIANTE)
        : [...prevSelected, estudiante];
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // Usar handleFilterChange solo para los filtros relevantes
    if (name === 'proyecto_tutoring' || name === 'asignatura_tutoring' || name === 'grupo_tutoring') {
      handleFilterChange(name, value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === 'opcion_horario') {
      if (value === 'presencial') {
        setFormData((prev) => ({
          ...prev,
          link_tutoring: ''
        }));
        setLinkError('');
      } else if (value === 'virtual') {
        setFormData((prev) => ({
          ...prev,
          salon_tutoring: ''
        }));
        setLinkError('');
      }
    }

    if (name === 'link_tutoring') {
      if (value === '') {
        setLinkError('');
      } else {
        const linkRegex = /^(https?:\/\/)?(meet\.google\.com\/[a-zA-Z0-9_-]+|zoom\.us\/j\/[0-9]+|teams\.microsoft\.com\/l\/meetup-join\/[a-zA-Z0-9_-]+.*?)/;
        if (!linkRegex.test(value)) {
          setLinkError('El link no es válido');
        } else {
          setLinkError('');
        }
      }
    }

    if (name === 'hora_inicio' || name === 'hora_fin') {
      const { hora_inicio, hora_fin } = { ...formData, [name]: value };
      if (hora_inicio && hora_fin && hora_fin <= hora_inicio) {
        setTimeError('La hora de fin debe ser mayor que la hora de inicio');
      } else {
        setTimeError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const key in formData) {
      if (formData[key] === '' && key !== 'link_tutoring' && key !== 'salon_tutoring') {
        toast.error('Por favor, completa todos los campos antes de enviar el formulario.');
        return;
      }
    }

    if (selectedEstudiantes.length === 0) {
      toast.error('Por favor, selecciona al menos un estudiante.');
      return;
    }

    if (formData.opcion_horario === 'virtual') {
      const linkRegex = /^(https?:\/\/)?(meet\.google\.com\/[a-zA-Z0-9_-]+|zoom\.us\/j\/[0-9]+|teams\.microsoft\.com\/l\/meetup-join\/[a-zA-Z0-9_-]+.*?)/;
      if (!linkRegex.test(formData.link_tutoring)) {
        toast.error('El link no es válido');
        return;
      }
      if (formData.link_tutoring === '') {
        toast.error('Por favor, proporciona el link de la tutoría virtual.');
        return;
      }
    }

    if (formData.opcion_horario === 'presencial' && formData.salon_tutoring === '') {
      toast.error('Por favor, proporciona el salón de la tutoría presencial.');
      return;
    }

    if (formData.hora_fin <= formData.hora_inicio) {
      toast.error('La hora de fin debe ser mayor que la hora de inicio.');
      return;
    }

    const dataToSend = {
      ...formData,
      estudiantes: selectedEstudiantes
    };
    console.log('Datos enviados:', dataToSend);
    try {
      const response = await fetch(`http://192.168.0.46:3001/api/tutoring/tutorias/${tutoria.tutoriaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Tutoría actualizada con éxito.');
        onTutoriaUpdated();  // Asegura que esta función siempre exista
        onVolverClick();
      } else {
        toast.error(data.error || 'Error al actualizar la tutoría');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión con el servidor');
    }
  };
  return (
    <div className='container'>
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <div className='create'>
          <h1>Editar Tutoría</h1>
          <div className='create-form'>
            <label htmlFor="name_tutoring">Nombre:</label>
            <input
              type="text"
              id="name_tutoring"
              name="name_tutoring"
              value={formData.name_tutoring}
              onChange={handleInputChange}
              required
            />

            <label htmlFor="facultad_tutoring">Facultad:</label>
            <select
              id="facultad_tutoring"
              name="facultad_tutoring"
              value={formData.facultad_tutoring}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecciona una facultad</option>
              {facultades.map((facultad, index) => (
                <option key={index} value={facultad}>
                  {facultad}
                </option>
              ))}
            </select>

            <label htmlFor="proyecto_tutoring">Proyecto Curricular:</label>
            <select
              id="proyecto_tutoring"
              name="proyecto_tutoring"
              value={formData.proyecto_tutoring}
              onChange={handleInputChange}
              disabled={!formData.facultad_tutoring}
              required
            >
              <option value="">Selecciona un proyecto</option>
              {proyectos.map((proyecto, index) => (
                <option key={index} value={proyecto}>
                  {proyecto}
                </option>
              ))}
            </select>

            <label htmlFor="asignatura_tutoring">Asignatura:</label>
            <select
              id="asignatura_tutoring"
              name="asignatura_tutoring"
              value={formData.asignatura_tutoring}
              onChange={handleInputChange}
              disabled={!formData.proyecto_tutoring}
              required
            >
              <option value="">Selecciona una asignatura</option>
              {asignaturas.map((asignatura, index) => (
                <option key={index} value={asignatura}>
                  {asignatura}
                </option>
              ))}
            </select>

            <label htmlFor="grupo_tutoring">Grupo:</label>
            <select
              name="grupo_tutoring"
              value={formData.grupo_tutoring}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecciona un grupo</option>
              {grupos.map((grupo) => (
                <option key={grupo} value={grupo}>
                  {grupo}
                </option>
              ))}
            </select>

            <label htmlFor="tutor_tutoring">Profesor:</label>
            <select
              id="tutor_tutoring"
              name="tutor_tutoring"
              value={formData.tutor_tutoring}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecciona un profesor</option>
              {profesores.map((profesor, index) => (
                <option key={index} value={profesor}>
                  {profesor}
                </option>
              ))}
            </select>

            <div className='size-label'>
              {estudiantes.length === 0 ? (
                <p>No hay estudiantes disponibles</p>
              ) : (
                estudiantes.map((estudiante) => (
                  <div key={estudiante.COD_ESTUDIANTE}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedEstudiantes.some(e => e.COD_ESTUDIANTE === estudiante.COD_ESTUDIANTE)}
                        onChange={() => handleEstudianteChange(estudiante)}
                      />
                      {estudiante.ESTUDIANTE}
                    </label>
                  </div>
                ))
              )}
            </div>

            <label htmlFor="descripcion_tutoring">Descripción Tema:</label>
            <textarea
              id="descripcion_tutoring"
              name="descripcion_tutoring"
              placeholder="Descripción"
              value={formData.descripcion_tutoring}
              onChange={handleInputChange}
              required
            />

            <fieldset>
              <legend>Modalidad:</legend>
              <div>
                <input
                  type="radio"
                  id="presencial"
                  name="opcion_horario"
                  value="presencial"
                  checked={formData.opcion_horario === 'presencial'}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="presencial">Presencial</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="virtual"
                  name="opcion_horario"
                  value="virtual"
                  checked={formData.opcion_horario === 'virtual'}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="virtual">Virtual</label>
              </div>
            </fieldset>

            <label htmlFor="link_tutoring">Link Tutoría:</label>
            <input
              type="text"
              id="link_tutoring"
              name="link_tutoring"
              value={formData.link_tutoring}
              onChange={handleInputChange}
              disabled={formData.opcion_horario !== 'virtual'}
              required={formData.opcion_horario === 'virtual'}
            />
            {linkError && <p style={{ color: 'red' }}>{linkError}</p>}

            <label htmlFor="salon_tutoring">Sede Salón:</label>
            <input
              type="text"
              id="salon_tutoring"
              name="salon_tutoring"
              value={formData.salon_tutoring}
              onChange={handleInputChange}
              disabled={formData.opcion_horario !== 'presencial'}
              required={formData.opcion_horario === 'presencial'}
            />

            <label htmlFor="fecha_tutoring">Fecha:</label>
            <input
              type="date"
              id="fecha_tutoring"
              name="fecha_tutoring"
              value={formData.fecha_tutoring}
              onChange={handleInputChange}
              required
            />

            <label htmlFor="hora_inicio">Hora de Inicio:</label>
            <input
              type="time"
              id="hora_inicio"
              name="hora_inicio"
              value={formData.hora_inicio}
              onChange={handleInputChange}
              required
            />

            <label htmlFor="hora_fin">Hora de Fin:</label>
            <input
              type="time"
              id="hora_fin"
              name="hora_fin"
              value={formData.hora_fin}
              onChange={handleInputChange}
              required
            />
            {timeError && <p style={{ color: 'red' }}>{timeError}</p>}

            <button type="submit">Actualizar Tutoría</button>
            <button type="button" onClick={onVolverClick}>Volver</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditarTutoria;
