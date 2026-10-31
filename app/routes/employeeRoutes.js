// app/routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerUsuarios, cambiarRolUsuario } = require('../controllers/employeeController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

// Rutas protegidas solo para el Administrador
router.get('/users', verificarToken, permitirRoles('ADMINISTRADOR'), obtenerUsuarios);
router.put('/users/role', verificarToken, permitirRoles('ADMINISTRADOR'), cambiarRolUsuario);

module.exports = router;