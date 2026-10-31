// app/controllers/roomController.js
const prisma = require('../config/db');

// 1. Crear una nueva habitación (Solo Administradores)
const crearHabitacion = async (req, res) => {
    try {
        const { numeroCuarto, tipo, precioNoche, descripcion, videoUrl, imagenes } = req.body;

        if (!numeroCuarto || !tipo || !precioNoche) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El número de cuarto, tipo y precio por noche son obligatorios.'
            });
        }

        // Validar que el número de cuarto no esté registrado previamente
        const habitacionExistente = await prisma.room.findUnique({
            where: { numeroCuarto }
        });

        if (habitacionExistente) {
            return res.status(400).json({
                ok: false,
                mensaje: `La habitación con el número ${numeroCuarto} ya se encuentra registrada.`
            });
        }

        // Registrar la habitación en PostgreSQL
        const nuevaHabitacion = await prisma.room.create({
            data: {
                numeroCuarto,
                tipo,
                precioNoche: parseFloat(precioNoche),
                descripcion,
                videoUrl,
                imagenes: imagenes || [] // Guardará arreglo de URLs de fotos WebP
            }
        });

        return res.status(201).json({
            ok: true,
            mensaje: 'Habitación registrada exitosamente 🏨',
            habitacion: nuevaHabitacion
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error interno al registrar la habitación',
            error: error.message
        });
    }
};

// 2. Obtener el catálogo completo de habitaciones (Acceso Público)
const obtenerHabitaciones = async (req, res) => {
    try {
        const habitaciones = await prisma.room.findMany({
            where: { disponible: true },
            orderBy: { numeroCuarto: 'asc' }
        });

        return res.json({
            ok: true,
            total: habitaciones.length,
            habitaciones
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al consultar el catálogo de habitaciones',
            error: error.message
        });
    }
};

// 3. Obtener detalle de una habitación por ID (Acceso Público)
const obtenerHabitacionPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const habitacion = await prisma.room.findUnique({
            where: { id }
        });

        if (!habitacion) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Habitación no encontrada.'
            });
        }

        return res.json({
            ok: true,
            habitacion
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar la habitación',
            error: error.message
        });
    }
};

// 4. Actualizar datos de una habitación (Solo Administradores)
const actualizarHabitacion = async (req, res) => {
    try {
        const { id } = req.params;
        const datosActualizados = req.body;

        const habitacionExistente = await prisma.room.findUnique({ where: { id } });
        if (!habitacionExistente) {
            return res.status(404).json({ ok: false, mensaje: 'Habitación no encontrada.' });
        }

        const habitacion = await prisma.room.update({
            where: { id },
            data: datosActualizados
        });

        return res.json({
            ok: true,
            mensaje: 'Habitación actualizada correctamente',
            habitacion
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al actualizar la habitación',
            error: error.message
        });
    }
};

module.exports = {
    crearHabitacion,
    obtenerHabitaciones,
    obtenerHabitacionPorId,
    actualizarHabitacion
};