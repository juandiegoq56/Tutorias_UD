import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  Button,
  Box
} from '@mui/material';

const DetallesTutoria = ({ tutoria, onVolverClick }) => {
  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Card sx={{ maxWidth: 600, width: '100%', boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Detalles de la Tutoría
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Título:</strong> {tutoria.titulo}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Descripción:</strong> {tutoria.descripcion || 'No disponible'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Profesor:</strong> {tutoria.profesor}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Fecha:</strong> {new Date(tutoria.fecha).toLocaleDateString()}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Facultad:</strong> {tutoria.facultad}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Proyecto Curricular:</strong> {tutoria.proyecto}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Hora Tutoría:</strong> {tutoria.horaInicio} - {tutoria.horaFin}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Asignatura:</strong> {tutoria.asignatura}
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={2}>
            <strong>Estudiantes:</strong>
          </Typography>
          <List>
            {tutoria.estudiantes.map((estudiante, idx) => (
              <ListItem key={idx}>
                {estudiante.estudianteCod} - {estudiante.estudiante}
              </ListItem>
            ))}
          </List>
          <Button variant="contained" color="primary" onClick={onVolverClick} sx={{ mt: 2 }}>
            Volver
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DetallesTutoria;
