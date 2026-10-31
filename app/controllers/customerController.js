// app/controllers/customerController.js
const prisma = require('../config/db');

// Obtener el listado de todos los clientes (Usuarios registrados con rol CLIENTE y huéspedes de reservas)
const obtenerClientes = async (req, res) => {
    try {
        const usuariosClientes = await prisma.user.findMany({
            where: { rol: 'CLIENTE' },
            select: { id: true, nombre: true, email: true, createdAt: true }
        });

        return res.json({
            ok: true,
            total: usuariosClientes.length,
            clientes: usuariosClientes
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al consultar la lista de clientes',
            error: error.message
        });
    }
};

// Obtener historial de estancias/reservas de un cliente por su correo electrónico
const obtenerHistorialCliente = async (req, res) => {
    try {
        const { email } = req.params;

        const historial = await prisma.reservation.findMany({
            where: { email },
            include: {
                room: true,
                pago: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json({
            ok: true,
            emailCliente: email,
            totalReservas: historial.length,
            historial
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener el historial del cliente',
            error: error.message
        });
    }
};

module.exports = {
    obtenerClientes,
    obtenerHistorialCliente
};