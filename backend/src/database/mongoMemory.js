const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

const connectTestDB = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log('🧪 MongoDB en memoria conectado');
};

const disconnectTestDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
    console.log('🧪 MongoDB en memoria desconectado');
  }
};

module.exports = { connectTestDB, disconnectTestDB };
