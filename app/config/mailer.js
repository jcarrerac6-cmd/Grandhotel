// app/config/mailer.js
const nodemailer = require('nodemailer');
const dns = require('dns');
require('dotenv').config();

// Forzar la resolución DNS por IPv4 y usar servidores públicos (Google / Cloudflare)
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    connectionTimeout: 15000, // 15 segundos
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
        rejectUnauthorized: false
    }
});

const enviarCorreoReserva = async (reserva, tipoPago) => {
    try {
        const esEfectivo = tipoPago === 'EFECTIVO';
        
        const asunto = esEfectivo 
            ? `🏨 Pre-Reserva Confirmada - Hotel Backend (Pago en Recepción)`
            : `✅ Confirmación de Reserva y Factura - Hotel Backend`;

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
                <h2 style="color: #1a365d; text-align: center;">${esEfectivo ? '📌 Instrucciones de Pre-Reserva' : '🎉 ¡Reserva Confirmada!'}</h2>
                <p>Hola <strong>${reserva.nombreTitular}</strong>,</p>
                <p>${esEfectivo 
                    ? 'Hemos registrado tu solicitud de reserva. Recuerda realizar la liquidación del pago al momento de tu Check-in en recepción.' 
                    : 'Agradecemos tu pago. Tu reserva ha sido confirmada exitosamente.'}</p>
                
                <hr style="border: 0; border-top: 1px solid #eeeeee;" />
                
                <h3>Detalles de la Estancia</h3>
                <ul>
                    <li><strong>Código de Reserva:</strong> ${reserva.id}</li>
                    <li><strong>Huéspedes:</strong> ${reserva.adultos} Adulto(s), ${reserva.ninos} Niño(s)</li>
                    <li><strong>Total a Pagar:</strong> $${reserva.total.toFixed(2)}</li>
                    <li><strong>Estado del Pago:</strong> ${esEfectivo ? 'PENDIENTE_DE_PAGO (Efectivo)' : 'PAGADO (Tarjeta)'}</li>
                </ul>

                <hr style="border: 0; border-top: 1px solid #eeeeee;" />
                <p style="font-size: 12px; color: #777777; text-align: center;">Gracias por elegir nuestro hotel.</p>
            </div>
        `;

        const info = await transporter.sendMail({
            from: '"Grand Hotel" <no-reply@hotel.com>',
            to: reserva.email,
            subject: asunto,
            html: htmlContent
        });

        console.log(`✉️ Correo enviado exitosamente a: ${reserva.email} (ID: ${info.messageId})`);
    } catch (error) {
        console.error('❌ Error al enviar el correo electrónico:', error.message);
    }
};

module.exports = { enviarCorreoReserva };