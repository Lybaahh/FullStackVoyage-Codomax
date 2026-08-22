const mongoose = require("mongoose");

/* ===========================================================
   User schema.
   Stores hashed passwords only — never plaintext (see routes/auth.js,
   which hashes with bcrypt before save).
   =========================================================== */
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },       // e.g. "u1712345678901"
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }                // bcrypt hash
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
