// app/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { reporteOcupacion, reporteServicios } = require('../controllers/reportController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

router.use(verificarToken, permitirRoles('ADMINISTRADOR', 'EMPLEADO'));

router.get('/ocupacion', reporteOcupacion);
router.get('/servicios', reporteServicios);

module.exports = router;