// app/routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const { generarFactura, obtenerFacturaPorReserva } = require('../controllers/invoiceController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

router.use(verificarToken, permitirRoles('ADMINISTRADOR', 'EMPLEADO'));

router.post('/', generarFactura);
router.get('/reserva/:reservationId', obtenerFacturaPorReserva);

module.exports = router;