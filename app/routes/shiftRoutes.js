// app/routes/shiftRoutes.js
const express = require('express');
const router = express.Router();
const {
  registrarComputadora,
  obtenerComputadoras,
  iniciarTurno,
  cerrarTurno,
  obtenerReporteAfluencia
} = require('../controllers/shiftController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

// Registrar una nueva computadora (Solo ADMINISTRADOR)
router.post('/workstations', verificarToken, permitirRoles('ADMINISTRADOR'), registrarComputadora);

// Obtener lista de computadoras activas
router.get('/workstations', verificarToken, obtenerComputadoras);

// Iniciar y finalizar turno de trabajo
router.post('/start', verificarToken, iniciarTurno);
router.put('/end/:shiftId', verificarToken, cerrarTurno);

// Consultar reporte de afluencia por turno (Solo ADMINISTRADOR)
router.get('/affluence-report', verificarToken, permitirRoles('ADMINISTRADOR'), obtenerReporteAfluencia);

module.exports = router;