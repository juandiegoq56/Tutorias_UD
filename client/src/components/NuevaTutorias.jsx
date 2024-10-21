import React, { useState, useEffect } from 'react';
import data from '../Data/datosEstructurados.json'; // Importa el archivo JSON
import profesoresJson from '../Data/allOrganizedData.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/NuevaTutoria.css';

const NuevaTutoria = () => {
  const initialFormData = {
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
  };
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

  useEffect(() => {
    if (data) {
      const facultades = Object.keys(data);
      setFacultades(facultades);
    }
  }, []);

  useEffect(() => {
    // Cuando cambie la facultad
    if (formData.facultad_tutoring && data?.[formData.facultad_tutoring]) {
      const proyectos = Object.keys(data[formData.facultad_tutoring] || {});
      setProyectos(proyectos);
  
      // Limpiar los estados de niveles inferiores
      setAsignaturas([]);
      setGrupos([]);
      setProfesores([]);
      setEstudiantes([]);
      setSelectedEstudiantes([]);
      // Resetear formData para niveles inferiores
      setFormData((prev) => ({
        ...prev,
        proyecto_tutoring: '',
        asignatura_tutoring: '',
        grupo_tutoring: '',
        tutor_tutoring: ''
      }));
    } else {
      setProyectos([]);
      setAsignaturas([]);
      setGrupos([]);
      setProfesores([]);
      setEstudiantes([]);
      setSelectedEstudiantes([]);
      // Resetear formData si no hay facultad
      setFormData((prev) => ({
        ...prev,
        proyecto_tutoring: '',
        asignatura_tutoring: '',
        grupo_tutoring: '',
        tutor_tutoring: ''
      }));
    }
  }, [formData.facultad_tutoring]);
  
  useEffect(() => {
    // Cuando cambie el proyecto
    if (formData.proyecto_tutoring && formData.facultad_tutoring) {
      const asignaturas = Object.keys(data?.[formData.facultad_tutoring]?.[formData.proyecto_tutoring] || {});
      setAsignaturas(asignaturas);
  
      // Limpiar grupos, profesores y estudiantes al cambiar de proyecto
      setGrupos([]);
      setProfesores([]);
      setEstudiantes([]);
      setSelectedEstudiantes([]);
      // Resetear formData para niveles inferiores
      setFormData((prev) => ({
        ...prev,
        asignatura_tutoring: '',
        grupo_tutoring: '',
        tutor_tutoring: ''
      }));
    } else {
      setAsignaturas([]);
      setGrupos([]);
      setProfesores([]);
      setEstudiantes([]);
      setSelectedEstudiantes([]);
      // Resetear formData si no hay proyecto
      setFormData((prev) => ({
        ...prev,
        asignatura_tutoring: '',
        grupo_tutoring: '',
        tutor_tutoring: ''
      }));
    }
  }, [formData.proyecto_tutoring, formData.facultad_tutoring]);
  
  useEffect(() => {
    // Cuando cambie la asignatura
    if (formData.asignatura_tutoring && formData.proyecto_tutoring && formData.facultad_tutoring) {
      const gruposData = data?.[formData.facultad_tutoring]?.[formData.proyecto_tutoring]?.[formData.asignatura_tutoring] || [];
      const grupos = gruposData.map((item) => item.grupo);
      setGrupos(grupos);
  
      // Limpiar profesores y estudiantes al cambiar de asignatura
      setProfesores([]);
      setEstudiantes([]);
      setSelectedEstudiantes([]);
      // Resetear formData para niveles inferiores
      setFormData((prev) => ({
        ...prev,
        grupo_tutoring: '',
        tutor_tutoring: ''
      }));
    } else {
      setGrupos([]);
      setProfesores([]);
      setEstudiantes([]);
      setSelectedEstudiantes([])
      // Resetear formData si no hay asignatura
      setFormData((prev) => ({
        ...prev,
        grupo_tutoring: '',
        tutor_tutoring: ''
      }));
    }
  }, [formData.asignatura_tutoring, formData.proyecto_tutoring, formData.facultad_tutoring]);
  
  useEffect(() => {
    // Cuando cambie el grupo
    if (formData.grupo_tutoring && formData.asignatura_tutoring && formData.proyecto_tutoring && formData.facultad_tutoring) {
      const gruposData = data?.[formData.facultad_tutoring]?.[formData.proyecto_tutoring]?.[formData.asignatura_tutoring] || [];
      const grupoSeleccionado = gruposData.find((item) => item.grupo === formData.grupo_tutoring);
  
      if (grupoSeleccionado) {
        const profesorDocumento = grupoSeleccionado.documento;
  
        // Buscar la clave del profesor en el JSON de profesores
        const profesorKey = Object.keys(profesoresJson).find(key => {
          const [doc] = key.split(' - ');
          return parseInt(doc) === profesorDocumento;
        });
  
        if (profesorKey) {
          // Obtener el nombre completo del profesor desde la clave
          const profesorNombre = profesorKey.split(' - ')[1];
  
          // Actualizar el nombre del profesor en el estado
          setFormData((prev) => ({
            ...prev,
            tutor_tutoring: profesorNombre // Establece el nombre del profesor desde el JSON
          }));
  
          // Obtener los datos del grupo del profesor
          const grupoProfesorData = profesoresJson[profesorKey]?.[formData.asignatura_tutoring]?.[formData.grupo_tutoring];
          const estudiantesData = grupoProfesorData?.ESTUDIANTES || [];
          setEstudiantes(estudiantesData);
  
          // Establecer el nombre del profesor en el estado de profesores
          setProfesores([profesorNombre]);
        } else {
          setEstudiantes([]);
          setProfesores([]);
        }
      } else {
        setProfesores([]);
        setEstudiantes([]);
      }
      setSelectedEstudiantes([]);
    } else {
      setProfesores([]);
      setEstudiantes([]);
      setSelectedEstudiantes([]);
    }
  }, [formData.grupo_tutoring, formData.asignatura_tutoring, formData.proyecto_tutoring, formData.facultad_tutoring]);
  
  const handleEstudianteChange = (estudiante) => {
    setSelectedEstudiantes(prevSelected => {
      const isSelected = prevSelected.some(e => e.COD_ESTUDIANTE === estudiante.COD_ESTUDIANTE);
      const newSelected = isSelected
        ? prevSelected.filter(e => e.COD_ESTUDIANTE !== estudiante.COD_ESTUDIANTE)
        : [...prevSelected, estudiante];
  
      console.log("Estado actualizado:", newSelected);
      return newSelected;
    });
  };
  
  
    

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'opcion_horario') {
      if (value === 'presencial') {
        setFormData((prev) => ({
          ...prev,
          link_tutoring: ''
        }));
        setLinkError('');
      }
    }
    if (name === 'opcion_horario') {
      if (value === 'virtual') {
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
  const resetForm = () => {
    setFormData(initialFormData);
    setProyectos([]);
    setAsignaturas([]);
    setGrupos([]);
    setProfesores([]);
    setEstudiantes([]);
    setSelectedEstudiantes([]);
    setLinkError('');
    setTimeError('');
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

    // Asegúrate de incluir los estudiantes seleccionados en el formData
    const dataToSend = {
      ...formData,
      estudiantes: selectedEstudiantes
    };

    // Agregar console.log para verificar los estudiantes seleccionados
    console.log('Estudiantes seleccionados:', selectedEstudiantes);

    try {
      const response = await fetch('http://192.168.0.46:3001/api/tutoring/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();
      if (response.ok) {
      } else {
        toast.error(data.error || 'Error al recibir datos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión con el servidor');
    }
    console.log('Formulario enviado:', dataToSend);
    toast.success('Formulario enviado con éxito.');
    resetForm();
};


  return (
    <div className='container'>
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <div className='create'>
          <h1>Información de Tutorías</h1>
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

            <button type="submit">Crear Tutoría</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NuevaTutoria;