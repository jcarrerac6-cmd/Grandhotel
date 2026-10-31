// app/routes/supplierRoutes.js
const express = require('express');
const router = express.Router();
const { crearProveedor, obtenerProveedores } = require('../controllers/supplierController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

router.use(verificarToken, permitirRoles('ADMINISTRADOR', 'EMPLEADO'));

router.post('/', crearProveedor);
router.get('/', obtenerProveedores);

module.exports = router;