/* ===========================================================
   MongoDB connection.
   Reads MONGODB_URI from .env (see .env.example) and connects
   with Mongoose. Call connectDB() once, before app.listen().
   =========================================================== */
const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      "Missing MONGODB_URI. Copy .env.example to .env and set your MongoDB connection string."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected:", mongoose.connection.name);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
