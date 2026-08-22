require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

/* ---------- REST API ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

/* ---------- serve the frontend ---------- */
app.use(express.static(path.join(__dirname, "public")));

/* 404 for unknown API routes */
app.use("/api", (req, res) => res.status(404).json({ message: "Not found." }));

app.listen(PORT, () => {
  console.log(`Inkwell server running at http://localhost:${PORT}`);
});
