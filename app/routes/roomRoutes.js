// app/routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const { 
    crearHabitacion, 
    obtenerHabitaciones, 
    obtenerHabitacionPorId,
    actualizarHabitacion 
} = require('../controllers/roomController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

// Rutas Públicas (Cualquier cliente/visitante del sitio web)
router.get('/', obtenerHabitaciones);
router.get('/:id', obtenerHabitacionPorId);

// Rutas Protegidas (Solo accesibles por un usuario con rol ADMINISTRADOR)
router.post('/', verificarToken, permitirRoles('ADMINISTRADOR'), crearHabitacion);
router.put('/:id', verificarToken, permitirRoles('ADMINISTRADOR'), actualizarHabitacion);

module.exports = router;