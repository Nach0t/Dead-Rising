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
    const existeUsuario = await User.findOne({ nombreUsuario });
    if (existeUsuario) {
      return res.status(400).json({ error: 'Nombre de usuario ya registrado' });
    }

    const contraseñaEncriptada = await bcrypt.hash(contraseña, 10);
    const nuevoUsuario = new User({ nombreUsuario, contraseña: contraseñaEncriptada });
    await nuevoUsuario.save();

    const token = jwt.sign({ nombreUsuario }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ mensaje: 'Usuario registrado correctamente', token });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
