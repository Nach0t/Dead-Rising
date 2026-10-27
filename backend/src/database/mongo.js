const mongoose = require('mongoose');
const { mongoURI } = require('../config');

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB conectado');
  } catch (err) {
    console.error('❌ Error al conectar MongoDB:', err.message);
    throw err;
  }
};

module.exports = connectDB;
