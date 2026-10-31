// app/middlewares/auth.js
const jwt = require('jsonwebtoken');
const redis = require('../config/redis');

// Middleware 1: Verificar Token y validez de la sesión en Redis
const verificarToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        
        // Comprobar si se envió el encabezado "Authorization: Bearer <TOKEN>"
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Acceso denegado: No se proporcionó un Token válido.'
            });
        }

        const token = authHeader.split(' ')[1];

        // 1. Comprobar si el token está en la lista negra de Redis (Logout)
        const enListaNegra = await redis.get(`blacklist:${token}`);
        if (enListaNegra) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Sesión expirada o cerrada. Por favor, inicia sesión de nuevo.'
            });
        }

        // 2. Verificar la firma y vigencia del JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Adjuntar la información del usuario autenticado a la petición
        req.user = decoded;
        req.token = token;
        
        next(); // Permitir el paso al siguiente controlador
    } catch (error) {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token inválido o expirado.',
            error: error.message
        });
    }
};

// Middleware 2: Restringir acceso por roles (ADMINISTRADOR, EMPLEADO, CLIENTE)
const permitirRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({
                ok: false,
                mensaje: `Acceso prohibido: Tu rol (${req.user ? req.user.rol : 'Sin Rol'}) no tiene permisos para esta acción.`
            });
        }
        next();
    };
};

module.exports = {
    verificarToken,
    permitirRoles
};