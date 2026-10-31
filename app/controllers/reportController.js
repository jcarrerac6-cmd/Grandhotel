// app/controllers/reportController.js
const prisma = require('../config/db');

// KPI 1: Porcentaje de Ocupación por Rango de Fechas
const reporteOcupacion = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Debe especificar fechaInicio y fechaFin (Formato: YYYY-MM-DD).'
            });
        }

        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);

        // 1. Obtener total de habitaciones en el hotel
        const totalHabitaciones = await prisma.room.count();
        if (totalHabitaciones === 0) {
            return res.json({ ok: true, porcentajeOcupacion: '0.00%', mensaje: 'No hay habitaciones registradas.' });
        }

        // 2. Calcular total de días en el rango especificado
        const diasRango = Math.max(1, Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)));
        const capacidadTotalNoches = totalHabitaciones * diasRango;

        // 3. Buscar reservas confirmadas o pendientes que traslapen el rango
        const reservas = await prisma.reservation.findMany({
            where: {
                estado: { in: ['CONFIRMADA', 'PENDIENTE_DE_PAGO'] },
                fechaCheckIn: { lt: fin },
                fechaCheckOut: { gt: inicio }
            }
        });

        // 4. Sumar noches reservadas dentro del período
        let nochesReservadasTotal = 0;
        reservas.forEach(reserva => {
            const checkIn = new Date(reserva.fechaCheckIn) < inicio ? inicio : new Date(reserva.fechaCheckIn);
            const checkOut = new Date(reserva.fechaCheckOut) > fin ? fin : new Date(reserva.fechaCheckOut);
            const dias = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
            nochesReservadasTotal += dias;
        });

        // 5. Calcular porcentaje final
        const porcentaje = Math.min(100, (nochesReservadasTotal / capacidadTotalNoches) * 100);

        return res.json({
            ok: true,
            indicador: 'Porcentaje de Ocupación Hotelera',
            periodo: { desde: fechaInicio, hasta: fechaFin, diasTotales: diasRango },
            metricas: {
                totalHabitaciones,
                capacidadTotalNoches,
                nochesReservadasTotal,
                porcentajeOcupacion: `${porcentaje.toFixed(2)}%`
            }
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al generar reporte de ocupación',
            error: error.message
        });
    }
};

// KPI 2: Servicios Adicionales Más Solicitados / Disponibles
const reporteServicios = async (req, res) => {
    try {
        const servicios = await prisma.additionalService.findMany({
            orderBy: { precio: 'desc' }
        });

        // Agrupar por categoría
        const resumenPorCategoria = servicios.reduce((acc, srv) => {
            acc[srv.categoria] = (acc[srv.categoria] || 0) + 1;
            return acc;
        }, {});

        return res.json({
            ok: true,
            indicador: 'Resumen de Servicios Adicionales en Oferta',
            totalServicios: servicios.length,
            conteoPorCategoria: resumenPorCategoria,
            servicios
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al generar reporte de servicios',
            error: error.message
        });
    }
};

module.exports = {
    reporteOcupacion,
    reporteServicios
};