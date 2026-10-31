// app/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registrar, login, logout, obtenerPerfil } = require('../controllers/authController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

// Rutas públicas
router.post('/register', registrar);
router.post('/login', login);

// Rutas protegidas (Requieren Token activo)
router.post('/logout', verificarToken, logout);
router.get('/me', verificarToken, obtenerPerfil);

// Ruta protegida de prueba sólo para Administradores
router.get('/admin-dashboard', verificarToken, permitirRoles('ADMINISTRADOR'), (req, res) => {
    res.json({
        ok: true,
        mensaje: 'Bienvenido al panel privado de Administración Hotelera 🔐'
    });
});

module.exports = router;