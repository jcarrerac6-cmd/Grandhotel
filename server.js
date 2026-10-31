// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Importar Rutas de todos los Módulos
const authRoutes = require('./app/routes/authRoutes');
const roomRoutes = require('./app/routes/roomRoutes');
const reservationRoutes = require('./app/routes/reservationRoutes');
const customerRoutes = require('./app/routes/customerRoutes');
const employeeRoutes = require('./app/routes/employeeRoutes');
const supplierRoutes = require('./app/routes/supplierRoutes');
const additionalServiceRoutes = require('./app/routes/additionalServiceRoutes');
const invoiceRoutes = require('./app/routes/invoiceRoutes');
const reportRoutes = require('./app/routes/reportRoutes');
const shiftRoutes = require('./app/routes/shiftRoutes');

// Registro de Endpoints API REST
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/services', additionalServiceRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/shifts', shiftRoutes);

// Ruta de estado general
app.get('/', (req, res) => {
    res.json({
        ok: true,
        mensaje: 'API del Sistema Hotelero funcionando correctamente 🏨',
        timestamp: new Date()
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`URL de prueba: http://localhost:${PORT}`);
    console.log(`=================================`);
});