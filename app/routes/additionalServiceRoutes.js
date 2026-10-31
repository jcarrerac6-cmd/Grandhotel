// app/routes/additionalServiceRoutes.js
const express = require('express');
const router = express.Router();
const { crearServicio, obtenerServicios } = require('../controllers/additionalServiceController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

// Lectura pública de servicios, creación restringida
router.get('/', obtenerServicios);
router.post('/', verificarToken, permitirRoles('ADMINISTRADOR', 'EMPLEADO'), crearServicio);

module.exports = router;