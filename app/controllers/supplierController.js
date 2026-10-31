// app/controllers/supplierController.js
const prisma = require('../config/db');

// Registrar proveedor
const crearProveedor = async (req, res) => {
    try {
        const { nombre, empresa, telefono, email, servicio } = req.body;

        if (!nombre || !empresa || !telefono || !servicio) {
            return res.status(400).json({ ok: false, mensaje: 'Por favor completa la información del proveedor.' });
        }

        const proveedor = await prisma.supplier.create({
            data: { nombre, empresa, telefono, email: email || '', servicio }
        });

        return res.status(201).json({
            ok: true,
            mensaje: 'Proveedor registrado exitosamente 🚚',
            proveedor
        });
    } catch (error) {
        return res.status(500).json({ ok: false, mensaje: 'Error al registrar proveedor', error: error.message });
    }
};

// Listar proveedores
const obtenerProveedores = async (req, res) => {
    try {
        const proveedores = await prisma.supplier.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return res.json({ ok: true, total: proveedores.length, proveedores });
    } catch (error) {
        return res.status(500).json({ ok: false, mensaje: 'Error al consultar proveedores', error: error.message });
    }
};

module.exports = {
    crearProveedor,
    obtenerProveedores
};