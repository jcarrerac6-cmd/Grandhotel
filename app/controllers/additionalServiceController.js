// app/controllers/additionalServiceController.js
const prisma = require('../config/db');

// Registrar un nuevo servicio adicional
const crearServicio = async (req, res) => {
    try {
        const { categoria, nombre, precio } = req.body; // Categoria: RESTAURANTE, BAR, PARQUEO, PISCINA

        if (!categoria || !nombre || !precio) {
            return res.status(400).json({ ok: false, mensaje: 'Categoría, nombre y precio son obligatorios.' });
        }

        const servicio = await prisma.additionalService.create({
            data: {
                categoria: categoria.toUpperCase(),
                nombre,
                precio: parseFloat(precio)
            }
        });

        return res.status(201).json({
            ok: true,
            mensaje: 'Servicio adicional creado exitosamente 🍽️',
            servicio
        });
    } catch (error) {
        return res.status(500).json({ ok: false, mensaje: 'Error al registrar el servicio', error: error.message });
    }
};

// Obtener el catálogo de servicios adicionales
const obtenerServicios = async (req, res) => {
    try {
        const { categoria } = req.query; // Permite filtrar opcionalmente por ?categoria=RESTAURANTE
        const filtro = categoria ? { categoria: categoria.toUpperCase() } : {};

        const servicios = await prisma.additionalService.findMany({
            where: filtro,
            orderBy: { categoria: 'asc' }
        });

        return res.json({ ok: true, total: servicios.length, servicios });
    } catch (error) {
        return res.status(500).json({ ok: false, mensaje: 'Error al listar servicios', error: error.message });
    }
};

module.exports = {
    crearServicio,
    obtenerServicios
};