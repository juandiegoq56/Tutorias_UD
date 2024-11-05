import React, { useState, useEffect } from 'react';
import data from '../Data/datosEstructurados.json'; // Importa el archivo JSON
import profesoresJson from '../Data/allOrganizedData.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/NuevaTutoria.css';
import FormField from './FormField';
import { tooltips } from './tooltips';
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
 
  
  const [formData, setFormData] = useState(initialFormData);
  const [facultades, setFacultades] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [linkError, setLinkError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedEstudiantes, setSelectedEstudiantes] = useState([]);
  const [profesorHorario, setProfesorHorario] = useState([]);

  useEffect(() => {
    if (data) {
      const facultades = Object.keys(data);
      setFacultades(facultades);
    }
  }, []);

  useEffect(() => {
    if (formData.facultad_tutoring && data?.[formData.facultad_tutoring]) {
      const proyectos = Object.keys(data[formData.facultad_tutoring] || {});
      setProyectos(proyectos);
  
      setAsignaturas([]);
      setGrupos([]);
      setProfesores([]);
      setEstudiantes([]);
      setSelectedEstudiantes([]);
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
    if (formData.proyecto_tutoring && formData.facultad_tutoring) {
      const asignaturas = Object.keys(data?.[formData.facultad_tutoring]?.[formData.proyecto_tutoring] || {});
      setAsignaturas(asignaturas);
  
      setGrupos([]);
      setProfesores([]);
      setEstudiantes([]);
      setSelectedEstudiantes([]);
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
      setFormData((prev) => ({
        ...prev,
        asignatura_tutoring: '',
        grupo_tutoring: '',
        tutor_tutoring: ''
      }));
    }
  }, [formData.proyecto_tutoring, formData.facultad_tutoring]);

  useEffect(() => {
    if (formData.asignatura_tutoring && formData.proyecto_tutoring && formData.facultad_tutoring) {
      const gruposData = data?.[formData.facultad_tutoring]?.[formData.proyecto_tutoring]?.[formData.asignatura_tutoring] || [];
      const grupos = gruposData.map((item) => item.grupo);
      setGrupos(grupos);
  
      setProfesores([]);
      setEstudiantes([]);
      setSelectedEstudiantes([]);
      setFormData((prev) => ({
        ...prev,
        grupo_tutoring: '',
        tutor_tutoring: ''
      }));
    } else {
      setGrupos([]);
      setProfesores([]);
      setEstudiantes([]);
      setSelectedEstudiantes([]);
      setFormData((prev) => ({
        ...prev,
        grupo_tutoring: '',
        tutor_tutoring: ''
      }));
    }
  }, [formData.asignatura_tutoring, formData.proyecto_tutoring, formData.facultad_tutoring]);

  useEffect(() => {
    if (formData.grupo_tutoring && formData.asignatura_tutoring && formData.proyecto_tutoring && formData.facultad_tutoring) {
      const gruposData = data[formData.facultad_tutoring]?.[formData.proyecto_tutoring]?.[formData.asignatura_tutoring] || [];
      const grupoSeleccionado = gruposData.find((item) => item.grupo === formData.grupo_tutoring);
    
      if (grupoSeleccionado) {
        const profesoresDelGrupo = grupoSeleccionado.profesor || [];
    
        // Obtener los nombres de los profesores
        const nombresProfesores = profesoresDelGrupo.map(prof => {
          const profesorDocumento = prof.documento;
          const profesorKey = Object.keys(profesoresJson).find(key => {
            const [doc] = key.split(' - ');
            return parseInt(doc) === profesorDocumento;
          });
    
          if (profesorKey) {
            return profesorKey.split(' - ')[1];
          }
          return null;
        }).filter(nombre => nombre !== null);
    
        setProfesores(nombresProfesores);
    
        if (nombresProfesores.length > 0 && !formData.tutor_tutoring) {
          setFormData(prev => ({ ...prev, tutor_tutoring: nombresProfesores[0] }));
        }
  
        // Actualizar solo la lista de estudiantes aquí
        const profesorDocumento = profesoresDelGrupo[0]?.documento;
        const profesorKey = Object.keys(profesoresJson).find(key => {
          const [doc] = key.split(' - ');
          return parseInt(doc) === profesorDocumento;
        });
  
        if (profesorKey) {
          const grupoProfesorData = profesoresJson[profesorKey]?.[formData.asignatura_tutoring]?.[formData.grupo_tutoring];
          const estudiantesData = grupoProfesorData?.ESTUDIANTES || [];
          setEstudiantes(estudiantesData);
        } else {
          setEstudiantes([]);
        }
      } else {
        setProfesores([]);
        setEstudiantes([]);
        setProfesorHorario([]);
      }
      setSelectedEstudiantes([]);
    } else {
      setProfesores([]);
      setEstudiantes([]);
      setProfesorHorario([]);
      setSelectedEstudiantes([]);
    }
  }, [formData.grupo_tutoring, formData.asignatura_tutoring, formData.proyecto_tutoring, formData.facultad_tutoring]);
  
  // Nuevo useEffect para manejar los cambios del profesor seleccionado
  useEffect(() => {
    if (formData.tutor_tutoring && formData.asignatura_tutoring && formData.grupo_tutoring) {
        // Buscar la key del profesor seleccionado
        const profesorKey = Object.keys(profesoresJson).find(key => {
            const nombre = key.split(' - ')[1];
            return nombre === formData.tutor_tutoring;
        });
  
        if (profesorKey) {
            const horarioData = profesoresJson[profesorKey]?.[formData.asignatura_tutoring]?.[formData.grupo_tutoring]?.HORARIO || [];
            setProfesorHorario(horarioData);
            console.log(horarioData)
        } else {
            setProfesorHorario([]);
        }
    } else {
        setProfesorHorario([]);
    }
  }, [formData.tutor_tutoring, formData.asignatura_tutoring, formData.grupo_tutoring]);

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
  const getDayAbbreviation = (dateString) => {
    const date = new Date(dateString);
    const days = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
    return days[date.getUTCDay()];
};



const validateScheduleConflict = () => {
  const { hora_inicio, hora_fin, fecha_tutoring } = formData;

  try {
    const dayAbbreviation = getDayAbbreviation(fecha_tutoring);

    // Función para formatear la hora a formato hh:mm
    const formatHour = (hora) => {
      return hora.padStart(2, '0') + ':00';
    };

    for (const { DIA, HORA_BLOQUE } of profesorHorario) {
      if (DIA !== dayAbbreviation) continue;

      const [bloqueInicioStr, bloqueFinStr] = HORA_BLOQUE.split('-');
      // Solo formateamos las horas del bloque
      const bloqueInicio = formatHour(bloqueInicioStr);
      const bloqueFin = formatHour(bloqueFinStr);

      // Ahora podemos comparar directamente las cadenas ya que todas están en formato hh:mm
      if ((hora_inicio >= bloqueInicio && hora_inicio < bloqueFin) || 
          (hora_fin > bloqueInicio && hora_fin <= bloqueFin) || 
          (hora_inicio <= bloqueInicio && hora_fin >= bloqueFin)) {
        console.log('Conflicto detectado');
        return false;
      }
    }
    console.log('No hay conflictos');
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
};

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  
    const minTime = '06:00';
    const maxTime = '21:30';
  
    if (name === 'hora_inicio' || name === 'hora_fin') {
      const { hora_inicio, hora_fin } = { ...formData, [name]: value };
  
      if (name === 'hora_inicio' && (value < minTime || value > maxTime)) {
        setTimeError('La hora de inicio debe estar entre las 6:00 am y las 9:30 pm');
        return;
      }
  
      if (name === 'hora_fin' && (value < minTime || value > maxTime)) {
        setTimeError('La hora de fin debe estar entre las 6:00 am y las 9:30 pm');
        return;
      }
  
      if (hora_inicio && hora_fin && hora_fin <= hora_inicio) {
        setTimeError('La hora de fin debe ser mayor que la hora de inicio');
      } else {
        setTimeError('');
      }
    }
  
    if (name === 'opcion_horario') {
      if (value === 'presencial') {
        setFormData((prev) => ({
          ...prev,
          link_tutoring: ''
        }));
        setLinkError('');
      }
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
  const validateTimeRange = () => {
    const { hora_inicio, hora_fin } = formData;
    const start = new Date(`1970-01-01T${hora_inicio}:00`);
    const end = new Date(`1970-01-01T${hora_fin}:00`);
    const minTime = new Date(`1970-01-01T06:00:00`);
    const maxTime = new Date(`1970-01-01T21:30:00`);

    if (start < minTime || end > maxTime || start >= end) {
      setTimeError('Las horas deben estar entre 06:00 AM y 09:30 PM y la hora de fin debe ser despues de la hora de Inicio');
      return false;
    }

    setTimeError('');
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateTimeRange()) {
      toast.error("Por favor, corrige los errores antes de enviar el formulario.");
      return;
    }
    if (!validateScheduleConflict()) {
      toast.error("La tutoría no puede ser agendada durante el horario de clase del profesor. Por favor, elige otro horario.");
      return;
    }
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

    console.log('Estudiantes seleccionados:', selectedEstudiantes);

    try {
      const response = await fetch('http://localhost:3001/api/tutoring/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Formulario enviado con éxito.');
        resetForm();
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(data.error || 'Error al recibir datos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión con el servidor');
    }
    console.log('Formulario enviado:', dataToSend);
  };

  return (
    <div className='container'>
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <div className='create'>
          <h1>Información de Tutorías</h1>
          <div className='create-form'>
          
          <FormField 
              label="Nombre"
              tooltip={tooltips.name_tutoring}
            >
              <input
                type="text"
                id="name_tutoring"
                name="name_tutoring"
                value={formData.name_tutoring}
                onChange={handleInputChange}
                required
              />
            </FormField>
            
            <FormField 
          label="Facultad"
          tooltip={tooltips.facultad_tutoring}
          htmlFor="facultad_tutoring"
        >
          <select
            id="facultad_tutoring"
            name="facultad_tutoring"
            value={formData.facultad_tutoring}
            onChange={handleInputChange}
            className="form-control"
            required
          >
            <option value="">Selecciona una facultad</option>
            {facultades.map((facultad, index) => (
              <option key={index} value={facultad}>
                {facultad}
              </option>
            ))}
          </select>
        </FormField>

        <FormField 
            label="Proyecto Curricular"
            tooltip={tooltips.proyecto_tutoring}
            htmlFor="proyecto_tutoring"
          >
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
          </FormField>

          <FormField 
            label="Asignatura"
            tooltip={tooltips.asignatura_tutoring}
            htmlFor="asignatura_tutoring"
          >
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
          </FormField>

          <FormField 
            label="Grupo"
            tooltip={tooltips.grupo_tutoring}
            htmlFor="grupo_tutoring"
          >
            <select
              id="grupo_tutoring"
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
          </FormField>

          <FormField 
            label="Profesor"
            tooltip={tooltips.tutor_tutoring}
            htmlFor="tutor_tutoring"
          >
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
          </FormField>

          <FormField 
            label="Estudiante/s"
            tooltip={tooltips.estudiante_tutoring}
            htmlFor="estudiante_tutoring"
          >
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
          </FormField>

          <FormField 
            label="Descripción Tema"
            tooltip={tooltips.descripcion_tutoring}
            htmlFor="descripcion_tutoring"
          >
            <textarea
              id="descripcion_tutoring"
              name="descripcion_tutoring"
              placeholder="Descripción"
              value={formData.descripcion_tutoring}
              onChange={handleInputChange}
              required
            />
          </FormField>

          <FormField 
            label="Modalidad"
            tooltip={tooltips.opcion_horario}
          >
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
          </FormField>

          
          <FormField 
            label="Link Tutoría"
            tooltip={tooltips.link_tutoring}
            htmlFor="link_tutoring"
          >
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
          </FormField>

          <FormField 
            label="Sede Salón"
            tooltip={tooltips.salon_tutoring}
            htmlFor="salon_tutoring"
          >
            <input
              type="text"
              id="salon_tutoring"
              name="salon_tutoring"
              value={formData.salon_tutoring}
              onChange={handleInputChange}
              disabled={formData.opcion_horario !== 'presencial'}
              required={formData.opcion_horario === 'presencial'}
            />
          </FormField>
  
          <FormField 
            label="Fecha"
            tooltip={tooltips.fecha_tutoring}
            htmlFor="fecha_tutoring"
          >
            <input
              type="date"
              id="fecha_tutoring"
              name="fecha_tutoring"
              value={formData.fecha_tutoring}
              onChange={handleInputChange}
              required
            />
          </FormField>

          <FormField 
            label="Hora de Inicio"
            tooltip={tooltips.hora_inicio}
            htmlFor="hora_inicio"
          >
            <input
              type="time"
              id="hora_inicio"
              name="hora_inicio"
              value={formData.hora_inicio}
              onChange={handleInputChange}
              required
            />
          </FormField>

         
          <FormField 
            label="Hora de Fin"
            tooltip={tooltips.hora_fin}
            htmlFor="hora_fin"
          >
            <input
              type="time"
              id="hora_fin"
              name="hora_fin"
              value={formData.hora_fin}
              onChange={handleInputChange}
              required
            />
            {timeError && <p style={{ color: 'red' }}>{timeError}</p>}
          </FormField>

  
              <button type="submit">Crear Tutoría</button>
            </div>
          </div>
        </form>
      </div>
    );
  };
  
  export default NuevaTutoria;
  