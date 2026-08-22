require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { connectDB } = require("./utils/db");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

/* ---------- REST API ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

/* ---------- serve the frontend ---------- */
app.use(express.static(path.join(__dirname, "public")));

/* 404 for unknown API routes */
app.use("/api", (req, res) => res.status(404).json({ message: "Not found." }));

/* ---------- connect to MongoDB, then start listening ---------- */
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Inkwell server running at http://localhost:${PORT}`);
  });
});
