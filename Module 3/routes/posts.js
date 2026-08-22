const express = require("express");
const Post = require("../models/Post");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

/* ---------- GET /api/posts ---------- */
router.get("/", async (req, res) => {
  try {
    // Newest first. createdAt (added by Mongoose timestamps) reliably breaks
    // ties between posts that share the same `date` string.
    const posts = await Post.find().sort({ date: -1, createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong loading posts." });
  }
});

/* ---------- GET /api/posts/:id ---------- */
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) return res.status(404).json({ message: "Post not found." });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong loading that post." });
  }
});

/* ---------- POST /api/posts (create) ---------- */
router.post("/", requireAuth, async (req, res) => {
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

  try {
    const newPost = await Post.create({
      id: "p" + Date.now(),
      title: title.trim(),
      tag: tag.trim(),
      image: image || null,
      excerpt,
      content: trimmedContent,
      author: req.user.name,
      authorId: req.user.id,
      date: new Date().toISOString().slice(0, 10)
    });

    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong publishing your post." });
  }
});

/* ---------- PUT /api/posts/:id (edit — author only) ---------- */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) return res.status(404).json({ message: "Post not found." });

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

    post.title = title.trim();
    post.tag = tag.trim();
    post.image = image === undefined ? post.image : image;
    post.excerpt = excerpt;
    post.content = trimmedContent;

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong updating your post." });
  }
});

/* ---------- DELETE /api/posts/:id (author only) ---------- */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) return res.status(404).json({ message: "Post not found." });

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own posts." });
    }

    await Post.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong deleting your post." });
  }
});

module.exports = router;
