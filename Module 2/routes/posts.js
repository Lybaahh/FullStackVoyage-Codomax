const express = require("express");
const { readDb, writeDb } = require("../utils/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function sortByDateDesc(posts) {
  // Posts created on the same day all share the same `date` string, so a
  // plain date sort can't tell them apart and leaves the newest one buried.
  // Break ties using the timestamp embedded in the post id ("p" + Date.now()).
  return [...posts].sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date);
    if (dateDiff !== 0) return dateDiff;
    const aTs = parseInt(String(a.id).replace(/\D/g, ""), 10) || 0;
    const bTs = parseInt(String(b.id).replace(/\D/g, ""), 10) || 0;
    return bTs - aTs;
  });
}

/* ---------- GET /api/posts ---------- */
router.get("/", (req, res) => {
  const db = readDb();
  res.json(sortByDateDesc(db.posts));
});

/* ---------- GET /api/posts/:id ---------- */
router.get("/:id", (req, res) => {
  const db = readDb();
  const post = db.posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found." });
  res.json(post);
});

/* ---------- POST /api/posts (create) ---------- */
router.post("/", requireAuth, (req, res) => {
  const { title, tag, image, content } = req.body || {};

  if (!title || title.trim().length < 3) {
    return res.status(400).json({ message: "Give your post a title (3+ characters)." });
  }
  if (!content || content.trim().length < 20) {
    return res.status(400).json({ message: "Write a little more before publishing (20+ characters)." });
  }
  if (!tag || tag.trim().length < 2) {
    return res.status(400).json({ message: "Choose or enter a category." });
  }

  const trimmedContent = content.trim();
  const excerpt = trimmedContent.slice(0, 140).trim() + (trimmedContent.length > 140 ? "…" : "");

  const db = readDb();
  const newPost = {
    id: "p" + Date.now(),
    title: title.trim(),
    tag: tag.trim(),
    image: image || null,
    excerpt,
    content: trimmedContent,
    author: req.user.name,
    authorId: req.user.id,
    date: new Date().toISOString().slice(0, 10)
  };

  db.posts.push(newPost);
  writeDb(db);

  res.status(201).json(newPost);
});

/* ---------- PUT /api/posts/:id (edit — author only) ---------- */
router.put("/:id", requireAuth, (req, res) => {
  const db = readDb();
  const idx = db.posts.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Post not found." });

  const post = db.posts[idx];
  if (post.authorId !== req.user.id) {
    return res.status(403).json({ message: "You can only edit your own posts." });
  }

  const { title, tag, image, content } = req.body || {};

  if (!title || title.trim().length < 3) {
    return res.status(400).json({ message: "Give your post a title (3+ characters)." });
  }
  if (!content || content.trim().length < 20) {
    return res.status(400).json({ message: "Write a little more before publishing (20+ characters)." });
  }
  if (!tag || tag.trim().length < 2) {
    return res.status(400).json({ message: "Choose or enter a category." });
  }

  const trimmedContent = content.trim();
  const excerpt = trimmedContent.slice(0, 140).trim() + (trimmedContent.length > 140 ? "…" : "");

  db.posts[idx] = {
    ...post,
    title: title.trim(),
    tag: tag.trim(),
    image: image === undefined ? post.image : image,
    excerpt,
    content: trimmedContent
  };
  writeDb(db);

  res.json(db.posts[idx]);
});

/* ---------- DELETE /api/posts/:id (author only) ---------- */
router.delete("/:id", requireAuth, (req, res) => {
  const db = readDb();
  const idx = db.posts.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Post not found." });

  if (db.posts[idx].authorId !== req.user.id) {
    return res.status(403).json({ message: "You can only delete your own posts." });
  }

  db.posts.splice(idx, 1);
  writeDb(db);

  res.json({ success: true });
});

module.exports = router;
