// app/config/db.js
const { PrismaClient } = require('@prisma/client');

// Inicializar el cliente de Prisma para realizar consultas
const prisma = new PrismaClient();

module.exports = prisma;