// app/controllers/shiftController.js
const prisma = require('../config/db');

// 1. Registrar una nueva computadora / terminal (Solo Admin)
const registrarComputadora = async (req, res) => {
  try {
    const { nombre, codigo, ubicacion } = req.body;

    if (!nombre || !codigo || !ubicacion) {
      return res.status(400).json({ ok: false, mensaje: 'Todos los campos son obligatorios.' });
    }

    const nuevaPC = await prisma.workstation.create({
      data: { nombre, codigo, ubicacion }
    });

    return res.status(201).json({ ok: true, mensaje: 'Computadora registrada 💻', computadora: nuevaPC });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al registrar computadora', error: error.message });
  }
};

// 2. Obtener lista de computadoras registradas
const obtenerComputadoras = async (req, res) => {
  try {
    const computadoras = await prisma.workstation.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' }
    });
    return res.json({ ok: true, computadoras });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener computadoras', error: error.message });
  }
};

// 3. Iniciar turno de un empleado en una computadora
const iniciarTurno = async (req, res) => {
  try {
    const { userId, workstationId } = req.body;

    const turnoActivo = await prisma.workShift.findFirst({
      where: {
        OR: [{ userId }, { workstationId }],
        estado: 'ACTIVO'
      }
    });

    if (turnoActivo) {
      return res.status(400).json({ ok: false, mensaje: 'El empleado o la computadora ya tienen un turno activo.' });
    }

    const nuevoTurno = await prisma.workShift.create({
      data: { userId, workstationId, estado: 'ACTIVO' }
    });

    return res.status(201).json({ ok: true, mensaje: 'Turno iniciado 🟢', turno: nuevoTurno });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al iniciar turno', error: error.message });
  }
};

// 4. Finalizar turno activo
const cerrarTurno = async (req, res) => {
  try {
    const { shiftId } = req.params;

    const turnoCerrado = await prisma.workShift.update({
      where: { id: shiftId },
      data: { estado: 'FINALIZADO', finTurno: new Date() }
    });

    return res.json({ ok: true, mensaje: 'Turno finalizado 🔴', turno: turnoCerrado });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al cerrar turno', error: error.message });
  }
};

// 5. Reporte de Afluencia por Turno y Computadora
const obtenerReporteAfluencia = async (req, res) => {
  try {
    const turnos = await prisma.workShift.findMany({
      include: {
        workstation: true
      },
      orderBy: { inicioTurno: 'desc' }
    });

    return res.json({ ok: true, totalTurnos: turnos.length, turnos });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener reporte de afluencia', error: error.message });
  }
};

module.exports = {
  registrarComputadora,
  obtenerComputadoras,
  iniciarTurno,
  cerrarTurno,
  obtenerReporteAfluencia
};