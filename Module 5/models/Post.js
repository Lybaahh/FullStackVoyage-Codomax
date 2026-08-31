const mongoose = require("mongoose");

/* ===========================================================
   Blog post schema.
   `id` is a public-facing string id (kept, rather than switching
   the frontend to Mongo's `_id`) so public/js/*.js needs no changes.
   =========================================================== */
const postSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },       // e.g. "p1712345678901"
  title: { type: String, required: true, trim: true },
  tag: { type: String, required: true, trim: true },
  image: { type: String, default: null },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  authorId: { type: String, required: true, index: true },
  date: { type: String, required: true }                    // "YYYY-MM-DD", matches old format
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
