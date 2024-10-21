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
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import '../css/HistorialTutorias.css';
import DetallesTutoria from './DetallesTutorias';

const HistorialTutorias = () => {
  const { profesorId } = useParams();
  const [tutorias, setTutorias] = useState([]);
  const [selectedTutoria, setSelectedTutoria] = useState(null);

  useEffect(() => {
    fetch(`http://192.168.0.46:3001/api/tutoring/tutoriasProfesor?profesorId=${profesorId}`)
      .then(response => response.json())
      .then(data => {
        const uniqueTutorias = groupStudentsByTutoriaId(data);
        setTutorias(uniqueTutorias);
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

  const handleTutoriaClick = (tutoria) => {
    setSelectedTutoria(tutoria);
  };

  const handleVolverClick = () => {
    setSelectedTutoria(null);
  };

  return (
    <div>
      {selectedTutoria ? (
        <DetallesTutoria tutoria={selectedTutoria} onVolverClick={handleVolverClick} />
      ) : (
        <div className="historial-tutorias" id="contenido">
          <a href="#contenido" className="skip-to-content">Saltar al contenido</a>
          <h1>Tutorías Realizadas ({tutorias.length})</h1>
          <p>Tutorias realizadas a la fecha</p>
          <TableContainer component={Paper} style={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Facultad</TableCell>
                  <TableCell>Proyecto Curricular</TableCell>
                  <TableCell>Profesor</TableCell>
                  <TableCell>Asignatura</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tutorias.map((tutoria, index) => (
                  <TableRow key={index}>
                    <TableCell>{tutoria.titulo}</TableCell>
                    <TableCell>{tutoria.facultad}</TableCell>
                    <TableCell>{tutoria.proyecto}</TableCell>
                    <TableCell>{tutoria.profesor}</TableCell>
                    <TableCell>{tutoria.asignatura}</TableCell>
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
