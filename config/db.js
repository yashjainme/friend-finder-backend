const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      // If already connected, return
      return;
    }
    
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options help with serverless deployments
      bufferCommands: false,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;