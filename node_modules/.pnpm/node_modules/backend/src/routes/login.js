const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();
require('dotenv').config();

router.post('/', async (req, res) => {
  const { nombreUsuario, contraseña } = req.body;

  if (!nombreUsuario || !contraseña) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const usuario = await User.findOne({ nombreUsuario });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const esValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!esValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ nombreUsuario }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ mensaje: 'Inicio de sesión exitoso', token });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
