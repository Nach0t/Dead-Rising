const express = require('express');
const User = require('../models/user'); // 👈 Asegúrate de que esta ruta sea correcta
const router = express.Router();

// GET /users - Obtener todos los usuarios registrados
router.get('/', async (req, res) => {
  try {
    const usuarios = await User.find().select('-contraseña'); // oculta la contraseña
    res.json(usuarios);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error del servidor al obtener usuarios' });
  }
});

module.exports = router;
