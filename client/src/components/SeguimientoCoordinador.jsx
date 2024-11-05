import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import '../css/Seguimiento.css'; // Asegúrate de que este archivo CSS existe

const SeguimientoTutorias = () => {
  const { profesorId } = useParams();
  const [tutorias, setTutorias] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [filters, setFilters] = useState({
    facultad: '',
    proyecto: '',
    asignatura: '',
    profesor: '',
    mes: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`http://localhost:3001/api/tutoring/tutoriaCoordinador?coordinadorId=${profesorId}`)
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
    const tutoriaFecha = new Date(tutoria.fecha);
    const tutoriaMes = tutoriaFecha.getMonth() + 1;

    return (
      (filters.facultad === '' || tutoria.facultad === filters.facultad) &&
      (filters.proyecto === '' || tutoria.proyecto === filters.proyecto) &&
      (filters.asignatura === '' || tutoria.asignatura === filters.asignatura) &&
      (filters.profesor === '' || tutoria.profesor === filters.profesor) &&
      (filters.mes === '' || tutoriaMes === parseInt(filters.mes))
    );
  });

  const asignaturas = getUniqueItems('asignatura', { facultad: filters.facultad, proyecto: filters.proyecto });
  const profesores = getUniqueItems('profesor', { facultad: filters.facultad, asignatura: filters.asignatura, proyecto: filters.proyecto });
  const proyectos = getUniqueItems('proyecto', { facultad: filters.facultad });

  const calculateHours = (horaInicio, horaFin) => {
    const [startHour, startMinutes] = horaInicio.split(':').map(Number);
    const [endHour, endMinutes] = horaFin.split(':').map(Number);

    const startDate = new Date(1970, 0, 1, startHour, startMinutes);
    const endDate = new Date(1970, 0, 1, endHour, endMinutes);

    const diff = (endDate - startDate) / 3600000; // Convertir milisegundos a horas
    return diff;
  };

  const generateExcel = () => {
    const worksheetData = tutoriasFiltradas.map(tutoria => {
      const horas = calculateHours(tutoria.horaInicio, tutoria.horaFin);
      return {
        Título: tutoria.titulo,
        Facultad: tutoria.facultad,
        Proyecto: tutoria.proyecto,
        Asignatura: tutoria.asignatura,
        Profesor: tutoria.profesor,
        Fecha: new Date(tutoria.fecha).toLocaleDateString(),
        "Hora Inicio": tutoria.horaInicio,
        "Hora Fin": tutoria.horaFin,
        Horas: horas.toFixed(2),
        "N° Estudiantes": tutoria.estudiantes.length
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tutorías");

    XLSX.writeFile(workbook, "seguimiento_tutorias.xlsx");
  };

  const handleDownloadExcel = () => {
    generateExcel();
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Seguimiento de Tutorías
      </Typography>
      <form onSubmit={(e) => { e.preventDefault(); handleDownloadExcel(); }}>
        <Grid container spacing={2}>
          {['facultad', 'proyecto', 'asignatura', 'profesor', 'mes'].map((filter, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <FormControl fullWidth>
                <InputLabel id={`${filter}-label`}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</InputLabel>
                <Select
                  labelId={`${filter}-label`}
                  id={filter}
                  name={filter}
                  value={filters[filter]}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  {(filter === 'facultad' ? facultades :
                    filter === 'proyecto' ? proyectos :
                    filter === 'asignatura' ? asignaturas :
                    filter === 'profesor' ? profesores :
                    filter === 'mes' ? Array.from({ length: 12 }, (_, i) => i + 1) : []
                  ).map((item, idx) => (
                    <MenuItem key={idx} value={item}>
                      {filter === 'mes' ? new Date(0, item - 1).toLocaleString('default', { month: 'long' }) : item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}
        </Grid>
        {error && <Typography color="error">{error}</Typography>}
        <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
          Generar Excel
        </Button>
      </form>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              {["Título", "Facultad", "Proyecto", "Asignatura", "Profesor", "Fecha", "Hora Inicio", "Hora Fin", "Horas", "N° Estudiantes"].map((headCell, index) => (
                <TableCell key={index}>{headCell}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tutoriasFiltradas.map((tutoria, index) => {
              const horas = calculateHours(tutoria.horaInicio, tutoria.horaFin);
              return (
                <TableRow key={index}>
                  <TableCell>{tutoria.titulo}</TableCell>
                  <TableCell>{tutoria.facultad}</TableCell>
                  <TableCell>{tutoria.proyecto}</TableCell>
                  <TableCell>{tutoria.asignatura}</TableCell>
                  <TableCell>{tutoria.profesor}</TableCell>
                  <TableCell>{new Date(tutoria.fecha).toLocaleDateString()}</TableCell>
                  <TableCell>{tutoria.horaInicio}</TableCell>
                  <TableCell>{tutoria.horaFin}</TableCell>
                  <TableCell>{horas.toFixed(2)}</TableCell>
                  <TableCell>{tutoria.estudiantes.length}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SeguimientoTutorias;
