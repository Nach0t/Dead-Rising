const connectDB = require('./src/database/mongo');
const app = require('./app');

connectDB(); // Solo conectamos la DB en este entorno

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
