// app/controllers/authController.js
const prisma = require('../config/db');
const redis = require('../config/redis');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Registro de usuario
const registrar = async (req, res) => {
    try {
        const { email, password, nombre, rol } = req.body;

        if (!email || !password || !nombre) {
            return res.status(400).json({ ok: false, mensaje: 'Email, contraseña y nombre son obligatorios.' });
        }

        // Verificar si el correo ya existe en la BD
        const usuarioExiste = await prisma.user.findUnique({ where: { email } });
        if (usuarioExiste) {
            return res.status(400).json({ ok: false, mensaje: 'El correo electrónico ya está registrado.' });
        }

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Crear el usuario
        const nuevoUsuario = await prisma.user.create({
            data: {
                email,
                password: passwordHash,
                nombre,
                rol: rol || 'CLIENTE' // Si no especifica rol, se le asigna CLIENTE por defecto
            }
        });

        res.status(201).json({
            ok: true,
            mensaje: 'Usuario registrado exitosamente',
            usuario: {
                id: nuevoUsuario.id,
                email: nuevoUsuario.email,
                nombre: nuevoUsuario.nombre,
                rol: nuevoUsuario.rol
            }
        });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error interno del servidor', error: error.message });
    }
};

// 2. Inicio de Sesión (Login)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ ok: false, mensaje: 'Por favor, ingresa correo y contraseña.' });
        }

        // Buscar el usuario por email
        const usuario = await prisma.user.findUnique({ where: { email } });
        if (!usuario) {
            return res.status(404).json({ ok: false, mensaje: 'Credenciales incorrectas (Usuario no encontrado).' });
        }

        // Comprobar contraseña
        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas (Contraseña no válida).' });
        }

        // Generar JWT
        const payload = {
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        // Guardar sesión activa en Redis (TTL de 24 horas = 86400 segundos)
        await redis.set(`session:${usuario.id}`, token, 'EX', 86400);

        res.json({
            ok: true,
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: payload
        });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al iniciar sesión', error: error.message });
    }
};

// 3. Cierre de Sesión (Logout)
const logout = async (req, res) => {
    try {
        const token = req.token;
        const userId = req.user.id;

        // Invalida la sesión actual del usuario en Redis
        await redis.del(`session:${userId}`);

        // Agrega el token actual a la lista negra con tiempo de expiración (24 horas)
        await redis.set(`blacklist:${token}`, 'true', 'EX', 86400);

        res.json({
            ok: true,
            mensaje: 'Cierre de sesión realizado con éxito.'
        });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al cerrar sesión', error: error.message });
    }
};

// 4. Perfil del Usuario Autenticado
const obtenerPerfil = async (req, res) => {
    res.json({
        ok: true,
        usuario: req.user
    });
};

module.exports = {
    registrar,
    login,
    logout,
    obtenerPerfil
};