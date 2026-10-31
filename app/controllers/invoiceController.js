// app/controllers/invoiceController.js
const prisma = require('../config/db');

// 1. Generar Factura Detallada (Alojamiento + Servicios Adicionales)
const generarFactura = async (req, res) => {
    try {
        const { reservationId, serviciosIds } = req.body; // serviciosIds: arreglo de IDs de servicios consumidos

        if (!reservationId) {
            return res.status(400).json({ ok: false, mensaje: 'El ID de la reserva es obligatorio.' });
        }

        // Verificar si la reserva existe
        const reserva = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { factura: true }
        });

        if (!reserva) {
            return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada.' });
        }

        if (reserva.factura) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Ya existe una factura asociada a esta reserva.',
                factura: reserva.factura
            });
        }

        // Calcular costo de servicios adicionales consumidos
        let montoServicios = 0;
        if (serviciosIds && Array.isArray(serviciosIds) && serviciosIds.length > 0) {
            const serviciosBD = await prisma.additionalService.findMany({
                where: { id: { in: serviciosIds } }
            });
            montoServicios = serviciosBD.reduce((acc, srv) => acc + srv.precio, 0);
        }

        const montoAlojamiento = reserva.total;
        const montoTotal = montoAlojamiento + montoServicios;
        const numeroFactura = `FAC-${Date.now().toString().slice(-8)}`;

        // Crear registro de Factura en BD
        const factura = await prisma.invoice.create({
            data: {
                numeroFactura,
                nit: reserva.nit || 'CF',
                nombreFiscal: reserva.nombreFiscal || reserva.nombreTitular,
                direccion: reserva.direccionFiscal || 'Ciudad',
                montoAlojamiento,
                montoServicios,
                montoTotal,
                reservationId: reserva.id
            }
        });

        return res.status(201).json({
            ok: true,
            mensaje: 'Factura generada exitosamente 📄',
            factura
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al generar la factura',
            error: error.message
        });
    }
};

// 2. Consultar Factura por ID de Reserva
const obtenerFacturaPorReserva = async (req, res) => {
    try {
        const { reservationId } = req.params;

        const factura = await prisma.invoice.findUnique({
            where: { reservationId },
            include: {
                reservation: {
                    include: { room: true, pago: true }
                }
            }
        });

        if (!factura) {
            return res.status(404).json({ ok: false, mensaje: 'No se encontró factura para esta reserva.' });
        }

        return res.json({ ok: true, factura });
    } catch (error) {
        return res.status(500).json({ ok: false, mensaje: 'Error al consultar la factura', error: error.message });
    }
};

module.exports = {
    generarFactura,
    obtenerFacturaPorReserva
};