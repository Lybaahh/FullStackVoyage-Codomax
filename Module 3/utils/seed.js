/* ===========================================================
   One-time (or repeatable) seed script.
   Run with: npm run seed
   Populates MongoDB with the same demo user + posts the old
   JSON-file "database" used to ship with, so the app has
   something to show right after setup.
   Safe to re-run: it skips creating records that already exist.
   =========================================================== */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { connectDB } = require("./db");
const User = require("../models/User");
const Post = require("../models/Post");

async function seed() {
  await connectDB();

  const seedUserId = "u1";

  let user = await User.findOne({ id: seedUserId });
  if (!user) {
    user = await User.create({
      id: seedUserId,
      name: "Mara Ellison",
      email: "mara@inkwell.dev",
      password: bcrypt.hashSync("password123", 10)
    });
    console.log("Seeded demo user: mara@inkwell.dev / password123");
  } else {
    console.log("Demo user already exists, skipping.");
  }

  const demoPosts = [
    {
      id: "p1",
      title: "The Case for Writing Things Down by Hand",
      tag: "Craft",
      image: null,
      excerpt: "Typing is fast. Fast is not always the point. On the friction that makes ideas stick.",
      content: "Typing is fast. Fast is not always the point.\n\nWhen I switched back to a paper notebook for first drafts, I expected to lose momentum. Instead I found something better: the slower pace forced me to finish a thought before starting the next one. Editing became a separate act, not a nervous tic performed mid-sentence.\n\nThis isn't a case against computers. It's a case for choosing your tools on purpose, instead of by default.",
      author: "Mara Ellison",
      authorId: seedUserId,
      date: "2026-07-02"
    },
    {
      id: "p2",
      title: "A Field Guide to Better Blog Titles",
      tag: "Notes",
      image: null,
      excerpt: "Most titles fail for one of three reasons. Here's how to catch them before you hit publish.",
      content: "Most weak titles fail for one of three reasons: they promise nothing, they promise too much, or they bury the actual subject under a clever phrase.\n\nBefore publishing, read your title next to your first paragraph. If they don't agree on what the post is about, rewrite one of them.",
      author: "Mara Ellison",
      authorId: seedUserId,
      date: "2026-06-18"
    },
    {
      id: "p3",
      title: "Shipping a Personal Blog in a Weekend",
      tag: "Build",
      image: null,
      excerpt: "You don't need a CMS, a build pipeline, or a database. You need a folder and an evening.",
      content: "You don't need a CMS, a build pipeline, or a database to start. You need a folder, a text editor, and an evening.\n\nStart with one page. Add a second when the first one is true to how you actually write. Everything else — comments, tags, search — can wait until the blog has enough posts to need it.",
      author: "Mara Ellison",
      authorId: seedUserId,
      date: "2026-05-27"
    }
  ];

  for (const p of demoPosts) {
    const exists = await Post.findOne({ id: p.id });
    if (!exists) {
      await Post.create(p);
      console.log(`Seeded post: ${p.title}`);
    } else {
      console.log(`Post "${p.title}" already exists, skipping.`);
    }
  }

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
