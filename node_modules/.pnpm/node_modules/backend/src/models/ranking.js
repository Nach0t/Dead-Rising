const mongoose = require('mongoose');

const rankingSchema = new mongoose.Schema({
  nombreUsuario: { type: String, required: true },
  zombies: { type: Number, required: true },
  tiempo: { type: Number, required: true },
  puntaje: { type: Number, required: true },
  nivel: { type: String, required: true },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ranking', rankingSchema);
