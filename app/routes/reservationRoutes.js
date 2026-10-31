// app/routes/reservationRoutes.js
const express = require('express');
const router = express.Router();
const { crearReserva, obtenerReservas } = require('../controllers/reservationController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

// Middleware opcional para verificar token si viene presente, sin bloquear invitados (Guests)
const authOpcional = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return verificarToken(req, res, next);
    }
    next();
};

// Ruta de creación de reservas (Permite compras con o sin sesión iniciada)
router.post('/', authOpcional, crearReserva);

// Ruta para consultar listado general de reservas (Solo ADMINISTRADOR y EMPLEADO)
router.get('/', verificarToken, permitirRoles('ADMINISTRADOR', 'EMPLEADO'), obtenerReservas);

module.exports = router;