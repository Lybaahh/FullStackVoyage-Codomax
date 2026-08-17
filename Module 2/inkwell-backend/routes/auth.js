const express = require("express");
const bcrypt = require("bcryptjs");
const { readDb, writeDb } = require("../utils/db");
const { requireAuth, signToken } = require("../middleware/auth");

const router = express.Router();

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

/* ---------- POST /api/auth/register ---------- */
router.post("/register", (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: "Enter your full name." });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password needs at least 6 characters." });
  }

  const db = readDb();
  const normalizedEmail = email.trim().toLowerCase();

  if (db.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ message: "An account with that email already exists." });
  }

  const newUser = {
    id: "u" + Date.now(),
    name: name.trim(),
    email: normalizedEmail,
    password: bcrypt.hashSync(password, 10)
  };

  db.users.push(newUser);
  writeDb(db);

  const token = signToken(newUser);
  res.status(201).json({ token, user: publicUser(newUser) });
});

/* ---------- POST /api/auth/login ---------- */
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const db = readDb();
  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "That email and password don't match our records." });
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

/* ---------- GET /api/auth/me ---------- */
router.get("/me", requireAuth, (req, res) => {
  const db = readDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json({ user: publicUser(user) });
});

module.exports = router;
