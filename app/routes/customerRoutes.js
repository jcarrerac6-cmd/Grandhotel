// app/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerClientes, obtenerHistorialCliente } = require('../controllers/customerController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

// Rutas protegidas para personal del hotel
router.get('/', verificarToken, permitirRoles('ADMINISTRADOR', 'EMPLEADO'), obtenerClientes);
router.get('/historial/:email', verificarToken, permitirRoles('ADMINISTRADOR', 'EMPLEADO'), obtenerHistorialCliente);

module.exports = router;