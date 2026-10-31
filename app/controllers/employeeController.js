// app/controllers/employeeController.js
const prisma = require('../config/db');

// 1. Obtener todos los usuarios registrados en el sistema
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      select: { id: true, nombre: true, email: true, rol: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ ok: true, usuarios });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener usuarios', error: error.message });
  }
};

// 2. Cambiar el rol de un usuario (Ej: de CLIENTE a EMPLEADO)
const cambiarRolUsuario = async (req, res) => {
  try {
    const { userId, nuevoRol } = req.body;

    if (!userId || !nuevoRol) {
      return res.status(400).json({ ok: false, mensaje: 'El ID de usuario y el nuevo rol son requeridos.' });
    }

    const usuarioActualizado = await prisma.user.update({
      where: { id: userId },
      data: { rol: nuevoRol },
      select: { id: true, nombre: true, email: true, rol: true }
    });

    return res.json({
      ok: true,
      mensaje: `Rol asignado correctamente como ${nuevoRol} 👤`,
      usuario: usuarioActualizado
    });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al cambiar rol', error: error.message });
  }
};

module.exports = {
  obtenerUsuarios,
  cambiarRolUsuario
};