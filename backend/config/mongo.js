const mongoose = require('mongoose');

let connectionPromise;

function connectMongo() {
  if (connectionPromise) return connectionPromise;
  const uri = process.env.MONGODB_URI;
  if (!uri) return Promise.reject(new Error('MONGODB_URI is not configured.'));
  connectionPromise = mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
    .then(() => mongoose.connection)
    .catch((error) => {
      connectionPromise = null;
      throw error;
    });
  return connectionPromise;
}

module.exports = { connectMongo };
