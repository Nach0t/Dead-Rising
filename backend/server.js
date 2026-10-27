const connectDB = require('./src/database/mongo');
const app = require('./app');

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Backend no iniciado: no se pudo conectar con MongoDB.', err.message);
    process.exit(1);
  });
