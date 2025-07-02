// config.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.docker') });

module.exports = {
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET
};
