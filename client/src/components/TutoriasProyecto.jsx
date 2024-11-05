import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DetallesTutoria from './DetallesTutorias';
import NuevaTutoria from './EditarTutoria';

const HistorialTutorias = () => {
  const { profesorId } = useParams();
  const [tutorias, setTutorias] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [selectedTutoria, setSelectedTutoria] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filters, setFilters] = useState({
    facultad: '',
    proyecto: '',
    asignatura: '',
    profesor: ''
  });

  const fetchTutorias = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/tutoring/tutoriaCoordinador?coordinadorId=${profesorId}`);
      const data = await response.json();
      const uniqueTutorias = groupStudentsByTutoriaId(data);
      setTutorias(uniqueTutorias);
      const facultadesUnicas = new Set(uniqueTutorias.map(tutoria => tutoria.facultad));
      setFacultades(Array.from(facultadesUnicas));
    } catch (error) {
      console.error('Error al cargar las tutorías:', error);
    }
  };

  useEffect(() => {
    fetchTutorias();
  }, []);

  const groupStudentsByTutoriaId = (array) => {
    const grouped = array.reduce((acc, curr) => {
      if (!acc[curr.tutoriaId]) {
        const { estudianteCod, estudiante, ...rest } = curr;
        acc[curr.tutoriaId] = { ...rest, estudiantes: [] };
      }
      acc[curr.tutoriaId].estudiantes.push({
        estudianteCod: curr.estudianteCod,
        estudiante: curr.estudiante
      });
      return acc;
    }, {});
    return Object.values(grouped);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, [name]: value };

      // Reset dependent filters
      if (name === 'facultad') {
        newFilters.proyecto = '';
        newFilters.asignatura = '';
        newFilters.profesor = '';
      }
      if (name === 'proyecto') {
        newFilters.asignatura = '';
        newFilters.profesor = '';
      }
      if (name === 'asignatura') {
        newFilters.profesor = '';
      }

      return newFilters;
    });
  };

  const handleTutoriaClick = (tutoria) => {
    setSelectedTutoria(tutoria);
  };

  const handleEditClick = (tutoria) => {
    setSelectedTutoria(tutoria);
    setIsEditing(true);
  };

  const handleDeleteClick = async (tutoriaId, onTutoriaDelete = () => {}) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta tutoría?");
    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:3001/api/tutoring/tutorias/${tutoriaId}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          setTutorias(tutorias.filter(tutoria => tutoria.tutoriaId !== tutoriaId));
          alert('Tutoría eliminada con éxito.');
          onTutoriaDelete();
        } else {
          alert('Error al eliminar la tutoría.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor.');
      }
    }
  };

  const handleVolverClick = () => {
    setSelectedTutoria(null);
    setIsEditing(false);
  };

  const getUniqueItems = (field, filters = {}) => {
    const uniqueItems = new Set();
    tutorias.forEach(tutoria => {
      let match = true;
      for (const key in filters) {
        if (filters[key] && tutoria[key] !== filters[key]) {
          match = false;
          break;
        }
      }
      if (match) uniqueItems.add(tutoria[field]);
    });
    return Array.from(uniqueItems);
  };

  const tutoriasFiltradas = tutorias.filter(tutoria => {
    return (
      (filters.facultad === '' || tutoria.facultad === filters.facultad) &&
      (filters.proyecto === '' || tutoria.proyecto === filters.proyecto) &&
      (filters.asignatura === '' || tutoria.asignatura === filters.asignatura) &&
      (filters.profesor === '' || tutoria.profesor === filters.profesor)
    );
  });

  const asignaturas = getUniqueItems('asignatura', { facultad: filters.facultad, proyecto: filters.proyecto });
  const profesores = getUniqueItems('profesor', { facultad: filters.facultad, asignatura: filters.asignatura, proyecto: filters.proyecto });
  const proyectos = getUniqueItems('proyecto', { facultad: filters.facultad });

  return (
    <div>
      {selectedTutoria ? (
        isEditing ? (
          <NuevaTutoria
            tutoria={selectedTutoria}
            onVolverClick={handleVolverClick}
            onTutoriaUpdated={fetchTutorias}
            onTutoriaDelete={fetchTutorias}
          />
        ) : (
          <DetallesTutoria tutoria={selectedTutoria} onVolverClick={handleVolverClick} />
        )
      ) : (
        <div className="historial-tutorias" id="contenido">
          <a href="#contenido" className="skip-to-content">Saltar al contenido</a>
          <h1>Tutorías Realizadas ({tutoriasFiltradas.length})</h1>
          <p>Tutorias realizadas a la fecha</p>
          <div className="filtros" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['facultad', 'proyecto', 'asignatura', 'profesor'].map((filter, index) => (
              <FormControl variant="outlined" margin="normal" key={index} style={{ minWidth: 120 }}>
                <InputLabel id={`${filter}-label`}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</InputLabel>
                <Select
                  labelId={`${filter}-label`}
                  id={filter}
                  name={filter}
                  value={filters[filter]}
                  onChange={handleFilterChange}
                  label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                >
                  <MenuItem value=""><em>All</em></MenuItem>
                  {(filter === 'facultad' ? facultades :
                    filter === 'proyecto' ? proyectos :
                    filter === 'asignatura' ? asignaturas :
                    filter === 'profesor' ? profesores : []
                  ).map((item, idx) => (
                    <MenuItem key={idx} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          </div>
          <TableContainer component={Paper} style={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Facultad</TableCell>
                  <TableCell>Proyecto Curricular</TableCell>
                  <TableCell>Profesor</TableCell>
                  <TableCell>Asignatura</TableCell>
                  <TableCell>Grupo</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tutoriasFiltradas.map((tutoria, index) => (
                  <TableRow key={index}>
                    <TableCell>{tutoria.titulo}</TableCell>
                    <TableCell>{tutoria.facultad}</TableCell>
                    <TableCell>{tutoria.proyecto}</TableCell>
                    <TableCell>{tutoria.profesor}</TableCell>
                    <TableCell>{tutoria.asignatura}</TableCell>
                    <TableCell>{tutoria.grupo}</TableCell>
                    <TableCell>{new Date(tutoria.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton style={{  color:'#0094DC'}} onClick={() => handleTutoriaClick(tutoria)}>
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton style={{  color: '#32CD32'}}  onClick={() => handleEditClick(tutoria)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteClick(tutoria.tutoriaId)}>
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </div>
  );
};

export default HistorialTutorias;
