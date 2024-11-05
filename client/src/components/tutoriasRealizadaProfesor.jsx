import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
import '../css/HistorialTutorias.css';
import DetallesTutoria from './DetallesTutorias';

const HistorialTutorias = () => {
  const { profesorId } = useParams();
  const [tutorias, setTutorias] = useState([]);
  const [selectedTutoria, setSelectedTutoria] = useState(null);
  const [facultades, setFacultades] = useState([]);
  const [filters, setFilters] = useState({
    facultad: '',
    proyecto: '',
    asignatura: '',
    grupo: '',
  });

  useEffect(() => {
    fetch(`http://localhost:3001/api/tutoring/tutoriasProfesor?profesorId=${profesorId}`)
      .then(response => response.json())
      .then(data => {
        const uniqueTutorias = groupStudentsByTutoriaId(data);
        setTutorias(uniqueTutorias);
        const facultadesUnicas = new Set(uniqueTutorias.map(tutoria => tutoria.facultad));
        setFacultades(Array.from(facultadesUnicas));
      });
  }, [profesorId]);

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
      switch (name) {
        case 'facultad':
          newFilters.proyecto = '';
          newFilters.asignatura = '';
          newFilters.grupo = '';
          break;
        case 'proyecto':
          newFilters.asignatura = '';
          newFilters.grupo = '';
          break;
        case 'asignatura':
          newFilters.grupo = '';
          break;
        default:
          break;
      }

      return newFilters;
    });
  };

  const handleTutoriaClick = (tutoria) => {
    setSelectedTutoria(tutoria);
  };

  const handleVolverClick = () => {
    setSelectedTutoria(null);
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
      (filters.grupo === '' || tutoria.grupo === filters.grupo)
    );
  });

  const proyectos = getUniqueItems('proyecto', { facultad: filters.facultad });
  const asignaturas = getUniqueItems('asignatura', { facultad: filters.facultad, proyecto: filters.proyecto });
  const grupos = getUniqueItems('grupo', { facultad: filters.facultad, proyecto: filters.proyecto, asignatura: filters.asignatura });

  return (
    <div>
      {selectedTutoria ? (
        <DetallesTutoria tutoria={selectedTutoria} onVolverClick={handleVolverClick} />
      ) : (
        <div className="historial-tutorias" id="contenido">
          <a href="#contenido" className="skip-to-content">Saltar al contenido</a>
          <h1>Tutorías Realizadas ({tutoriasFiltradas.length})</h1>
          <p>Tutorias realizadas a la fecha</p>
          <div className="filtros" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['facultad', 'proyecto', 'asignatura', 'grupo'].map((filter, index) => (
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
                    filter === 'grupo' ? grupos : []
                  ).map((item, idx) => (
                    <MenuItem key={idx} value={item}>{item}</MenuItem>
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
                      <IconButton onClick={() => handleTutoriaClick(tutoria)} style={{ color: '#0094DC' }}>
                        <VisibilityIcon />
                      </IconButton>
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
