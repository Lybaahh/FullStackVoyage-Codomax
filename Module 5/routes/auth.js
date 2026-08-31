const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { requireAuth, signToken } = require("../middleware/auth");

const router = express.Router();

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

/* ---------- POST /api/auth/register ---------- */
router.post("/register", async (req, res) => {
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

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }

    const newUser = await User.create({
      id: "u" + Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      password: bcrypt.hashSync(password, 10)
    });

    const token = signToken(newUser);
    res.status(201).json({ token, user: publicUser(newUser) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong creating your account." });
  }
});

/* ---------- POST /api/auth/login ---------- */
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "That email and password don't match our records." });
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong logging you in." });
  }
});

/* ---------- GET /api/auth/me ---------- */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

/* ---------- PUT /api/auth/profile (update name/email) ---------- */
router.put("/profile", requireAuth, async (req, res) => {
  const { name, email } = req.body || {};

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: "Enter your full name." });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (normalizedEmail !== user.email) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({ message: "An account with that email already exists." });
      }
    }

    user.name = name.trim();
    user.email = normalizedEmail;
    await user.save();

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong updating your profile." });
  }
});

/* ---------- PUT /api/auth/password (change password) ---------- */
router.put("/password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Enter your current and new password." });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password needs at least 6 characters." });
  }

  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ message: "Your current password is incorrect." });
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong updating your password." });
  }
});

module.exports = router;
