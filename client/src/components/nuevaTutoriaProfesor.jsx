import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import data from '../Data/datosEstructurados.json';
import profesoresJson from '../Data/allOrganizedData.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/NuevaTutoria.css';

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
          if (grupos.some(grupo => grupo.documento === parseInt(documento))) {
            return facultad;
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
    setGrupos([]);
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

    const dataToSend = {
      ...formData,
      estudiantes: selectedEstudiantes
    };

    try {
      const response = await fetch('http://192.168.0.46/api/tutoring/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Datos recibidos con éxito.');
      } else {
        toast.error(data.error || 'Error al recibir datos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión con el servidor');
    }
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

            <label htmlFor="asignatura_tutoring">Asignatura:</label>
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