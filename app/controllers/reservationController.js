// app/controllers/reservationController.js
const prisma = require('../config/db');
const stripe = require('../config/stripe');
const { enviarCorreoReserva } = require('../config/mailer');

// Crear una nueva reserva (Soporta pagos con Tarjeta/Stripe y Efectivo)
const crearReserva = async (req, res) => {
    try {
        const {
            nombreTitular,
            email,
            documentoId,
            telefono,
            roomId,
            fechaCheckIn,
            fechaCheckOut,
            adultos,
            ninos,
            nit,
            nombreFiscal,
            direccionFiscal,
            metodoPago, // 'TARJETA' o 'EFECTIVO'
            paymentMethodId // Token o ID del método de pago enviado por el cliente desde Stripe
        } = req.body;

        // 1. Validaciones básicas de campos requeridos
        if (!nombreTitular || !email || !documentoId || !telefono || !roomId || !fechaCheckIn || !fechaCheckOut || !metodoPago) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Por favor, completa todos los campos obligatorios de la reserva.'
            });
        }

        // 2. Verificar que la habitación exista y esté disponible
        const habitacion = await prisma.room.findUnique({ where: { id: roomId } });
        if (!habitacion || !habitacion.disponible) {
            return res.status(404).json({
                ok: false,
                mensaje: 'La habitación seleccionada no se encuentra disponible.'
            });
        }

        // 3. Calcular el costo total según los días de estancia
        const fechaInicio = new Date(fechaCheckIn);
        const fechaFin = new Date(fechaCheckOut);
        const diasEstancia = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));

        if (diasEstancia <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La fecha de Check-out debe ser posterior a la fecha de Check-in.'
            });
        }

        const montoTotal = diasEstancia * habitacion.precioNoche;

        // ID de usuario opcional (Si está autenticado toma el ID del token JWT, de lo contrario guarda como Guest)
        const userId = req.user ? req.user.id : null;

        // -------------------------------------------------------------
        // FLUJO DE PAGO Y CREACIÓN DE REGISTRO
        // -------------------------------------------------------------
        
        let stripePaymentIntentId = null;
        let estadoReserva = 'PENDIENTE_DE_PAGO';
        let estadoPago = 'PENDIENTE';

        if (metodoPago === 'TARJETA') {
            // PROCESAR PAGO VÍA STRIPE
            try {
                // Crear y confirmar el cobro en Stripe
                // ✅ CÓDIGO CORREGIDO
const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(montoTotal * 100),
    currency: 'usd',
    payment_method: paymentMethodId || 'pm_card_visa',
    confirm: true,
    automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
    },
    description: `Reserva de habitación ${habitacion.numeroCuarto} para ${nombreTitular}`
});

                if (paymentIntent.status === 'succeeded') {
                    stripePaymentIntentId = paymentIntent.id;
                    estadoReserva = 'CONFIRMADA';
                    estadoPago = 'PAGADO';
                } else {
                    return res.status(402).json({
                        ok: false,
                        mensaje: 'El pago no pudo ser autorizado por la entidad bancaria.'
                    });
                }
            } catch (stripeError) {
                // Si Stripe rechaza el cobro, la reserva NO se guarda
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error en la autorización del pago con tarjeta',
                    error: stripeError.message
                });
            }
        }

        // 4. Guardar la Reserva en la Base de Datos
        const reserva = await prisma.reservation.create({
            data: {
                nombreTitular,
                email,
                documentoId,
                telefono,
                fechaCheckIn: fechaInicio,
                fechaCheckOut: fechaFin,
                adultos: parseInt(adultos) || 1,
                ninos: parseInt(ninos) || 0,
                nit,
                nombreFiscal,
                direccionFiscal,
                estado: estadoReserva,
                total: montoTotal,
                roomId,
                userId,
                pago: {
                    create: {
                        monto: montoTotal,
                        metodo: metodoPago,
                        estado: estadoPago,
                        stripePaymentIntentId
                    }
                }
            },
            include: {
                room: true,
                pago: true
            }
        });

        // 5. Enviar Correo Electrónico Automático (Nodemailer)
        await enviarCorreoReserva(reserva, metodoPago);

        return res.status(201).json({
            ok: true,
            mensaje: metodoPago === 'TARJETA' 
                ? '¡Reserva confirmada y pago procesado con éxito! 💳' 
                : 'Reserva registrada en estado pendiente de pago en recepción. 💵',
            reserva
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error interno al procesar la reserva',
            error: error.message
        });
    }
};

// Consultar todas las reservas (Solo para Administradores y Empleados)
const obtenerReservas = async (req, res) => {
    try {
        const reservas = await prisma.reservation.findMany({
            include: {
                room: true,
                pago: true,
                user: {
                    select: { id: true, nombre: true, email: true, rol: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json({
            ok: true,
            total: reservas.length,
            reservas
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al consultar las reservas',
            error: error.message
        });
    }
};

module.exports = {
    crearReserva,
    obtenerReservas
};