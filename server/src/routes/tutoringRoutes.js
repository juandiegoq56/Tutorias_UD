const express = require('express');
const router = express.Router();
const tutoringController = require('../controllers/tutoringController');
const getTutoriaController = require('../controllers/getTutoriaController');
const loginid = require ('../controllers/loginid');
router.post('/', tutoringController.createTutoring);
router.get ('/tutorias',getTutoriaController.getTutoring);
router.get ('/tutoriasProfesor',getTutoriaController.getTutoringProfesor);
router.put('/tutorias/:id', tutoringController.updateTutoring);
router.post('/login',loginid.login);
router.delete('/tutorias/:id',tutoringController.deleteTutoria);
// Agregar rutas para leer, actualizar y eliminar
// router.get('/:id', tutoringController.getTutoring);
// router.put('/:id', tutoringController.updateTutoring);   
// router.delete('/:id', tutoringController.deleteTutoring);

module.exports = router;
