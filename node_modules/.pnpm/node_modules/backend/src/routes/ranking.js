const express = require('express');
const Ranking = require('../models/ranking');
const router = express.Router();

// Niveles según puntaje
const rankingThresholds = {
  "Don Pollo": 120,
  "Evie": 80,
  "Ruby-Chan": 50,
  "Frances": 0
};

function calcularNivel(puntaje) {
  if (puntaje >= rankingThresholds["Don Pollo"]) return "Don Pollo";
  if (puntaje >= rankingThresholds["Evie"]) return "Evie";
  if (puntaje >= rankingThresholds["Ruby-Chan"]) return "Ruby-Chan";
  return "Frances";
}

// POST guardar puntaje
router.post('/', async (req, res) => {
  const { nombreUsuario, zombies, tiempo, puntaje } = req.body;
  if (!nombreUsuario || zombies == null || tiempo == null || puntaje == null) {
    return res.status(400).json({ error: 'Faltan datos del ranking' });
  }

  try {
    const nivel = calcularNivel(puntaje);
    const nuevoRanking = new Ranking({ nombreUsuario, zombies, tiempo, puntaje, nivel });
    await nuevoRanking.save();
    res.status(201).json({ mensaje: 'Ranking guardado', nivel });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar ranking' });
  }
});

// GET todos
router.get('/', async (req, res) => {
  try {
    const datos = await Ranking.find().sort({ puntaje: -1 }).limit(10);
    res.json(datos);
  } catch {
    res.status(500).json({ error: 'Error al obtener rankings' });
  }
});

module.exports = router;
