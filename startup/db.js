const mongoose = require("mongoose");
const winston = require("winston");

module.exports = async function () {
  const db = process.env.DATABASE_CONNECTION_URL;

  if (!db) {
    winston.error("❌ DATABASE_CONNECTION_URL is not set");
    throw new Error("Missing DB connection string");
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    winston.info(`✅ MongoDB connected`);
  } catch (err) {
    winston.error("❌ MongoDB connection failed");
    throw err;
  }
};
