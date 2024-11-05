import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import data from '../Data/datosEstructurados.json';
import profesoresJson from '../Data/allOrganizedData.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/NuevaTutoria.css';
import FormField from './FormField';
import { tooltips } from './tooltips';
const NuevaTutoria = () => {
  const { profesorId } = useParams();
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
  const [asignaturas, setAsignaturas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedEstudiantes, setSelectedEstudiantes] = useState([]);
  const [linkError, setLinkError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [profesorHorario, setProfesorHorario] = useState([]);
  useEffect(() => {
    // Obtener asignaturas del profesor
    const profesorKey = Object.keys(profesoresJson).find(key => {
      const [doc] = key.split(' - ');
      return parseInt(doc) === parseInt(profesorId);
    });

    if (profesorKey) {
      const profesorData = profesoresJson[profesorKey];
      setFormData(prev => ({
        ...prev,
        tutor_tutoring: profesorKey.split(' - ')[1] // Nombre del profesor
      }));
      setAsignaturas(Object.keys(profesorData));
    }
  }, [profesorId]);

  useEffect(() => {
    // Cuando cambie la asignatura
    if (formData.asignatura_tutoring) {
      const profesorKey = Object.keys(profesoresJson).find(key => {
        const [doc] = key.split(' - ');
        return parseInt(doc) === parseInt(profesorId);
      });

      if (profesorKey) {
        const profesorData = profesoresJson[profesorKey];
        const grupos = Object.keys(profesorData[formData.asignatura_tutoring] || {});
        setGrupos(grupos);
        
        // Limpiar estudiantes
        setEstudiantes([]);
        setSelectedEstudiantes([]);
        setFormData(prev => ({
          ...prev,
          grupo_tutoring: '',
          proyecto_tutoring: profesorData[formData.asignatura_tutoring][grupos[0]].PROYECTO
        }));
      }
    } else {
      setGrupos([]);
      setEstudiantes([]);
      setSelectedEstudiantes([]);
      setFormData(prev => ({
        ...prev,
        grupo_tutoring: '',
        proyecto_tutoring: ''
      }));
    }
  }, [formData.asignatura_tutoring, profesorId]);

  useEffect(() => {
    // Cuando cambie el grupo
    if (formData.grupo_tutoring && formData.asignatura_tutoring) {
      const profesorKey = Object.keys(profesoresJson).find(key => {
        const [doc] = key.split(' - ');
        return parseInt(doc) === parseInt(profesorId);
      });

      if (profesorKey) {
        const profesorData = profesoresJson[profesorKey];
        const grupoData = profesorData[formData.asignatura_tutoring][formData.grupo_tutoring];
        const horarioData = profesoresJson[profesorKey]?.[formData.asignatura_tutoring]?.[formData.grupo_tutoring]?.HORARIO || [];
        setProfesorHorario(horarioData);
        console.log(horarioData)
        setEstudiantes(grupoData.ESTUDIANTES || []);
        setFormData(prev => ({
          ...prev,
          facultad_tutoring: obtenerFacultadPorDocumento(profesorId)
        }));
      }
    } else {
      setEstudiantes([]);
      setFormData(prev => ({
        ...prev,
        facultad_tutoring: ''
      }));
    }
  }, [formData.grupo_tutoring, formData.asignatura_tutoring, profesorId]);

  const obtenerFacultadPorDocumento = (documento) => {
    for (const facultad in data) {
      for (const proyecto in data[facultad]) {
        for (const asignatura in data[facultad][proyecto]) {
          const grupos = data[facultad][proyecto][asignatura];
          for (const grupo of grupos) {
            if (grupo.profesor && grupo.profesor.some(prof => prof.documento === parseInt(documento))) {
              return facultad;
            }
          }
        }
      }
    }
    return '';
  };
  

  const handleEstudianteChange = (estudiante) => {
    setSelectedEstudiantes((prevSelected) => {
      const isSelected = prevSelected.some((e) => e.COD_ESTUDIANTE === estudiante.COD_ESTUDIANTE);
      return isSelected
        ? prevSelected.filter((e) => e.COD_ESTUDIANTE !== estudiante.COD_ESTUDIANTE)
        : [...prevSelected, estudiante];
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
    setAsignaturas([]);
    setGrupos([]);
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
  label="Asignatura"
  tooltip={tooltips.asignatura_tutoring}
  htmlFor="asignatura_tutoring"
>
  <select
    id="asignatura_tutoring"
    name="asignatura_tutoring"
    value={formData.asignatura_tutoring}
    onChange={handleInputChange}
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

            <label htmlFor="tutor_tutoring">Profesor:</label>
            <input
              type="text"
              id="tutor_tutoring"
              name="tutor_tutoring"
              value={formData.tutor_tutoring}
              readOnly
            />

            <label htmlFor="proyecto_tutoring">Proyecto Curricular:</label>
            <input
              type="text"
              id="proyecto_tutoring"
              name="proyecto_tutoring"
              value={formData.proyecto_tutoring}
              readOnly
            />

            <label htmlFor="facultad_tutoring">Facultad:</label>
            <input
              type="text"
              id="facultad_tutoring"
              name="facultad_tutoring"
              value={formData.facultad_tutoring}
              readOnly
            />

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