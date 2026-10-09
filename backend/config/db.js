const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quizarena';
    console.log(`Connecting to MongoDB at: ${connStr}...`);
    
    // Attempt standard connection with a short timeout
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`Local MongoDB connection failed (${err.message}). Starting MongoMemoryServer...`);
    try {
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`InMemory MongoDB Connected successfully at: ${conn.connection.host}`);
    } catch (memErr) {
      console.error(`Failed to start MongoMemoryServer: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
