/* ===========================================================
   INKWELL — shared app logic
   Data is persisted in localStorage. This is a front-end-only
   demo: passwords are stored in plain text in the browser and
   must never be treated as a real authentication system.
   =========================================================== */

const DB_USERS = "inkwell_users";
const DB_POSTS = "inkwell_posts";
const DB_SESSION = "inkwell_session";

/* ---------- seed data (first run only) ---------- */
function seedIfEmpty() {
  if (!localStorage.getItem(DB_USERS)) {
    const users = [
      { id: "u1", name: "Mara Ellison", email: "mara@inkwell.dev", password: "password123" }
    ];
    localStorage.setItem(DB_USERS, JSON.stringify(users));
  }
  if (!localStorage.getItem(DB_POSTS)) {
    const posts = [
      {
        id: "p1",
        title: "The Case for Writing Things Down by Hand",
        tag: "Craft",
        excerpt: "Typing is fast. Fast is not always the point. On the friction that makes ideas stick.",
        content: "Typing is fast. Fast is not always the point.\n\nWhen I switched back to a paper notebook for first drafts, I expected to lose momentum. Instead I found something better: the slower pace forced me to finish a thought before starting the next one. Editing became a separate act, not a nervous tic performed mid-sentence.\n\nThis isn't a case against computers. It's a case for choosing your tools on purpose, instead of by default.",
        author: "Mara Ellison",
        authorId: "u1",
        date: "2026-07-02"
      },
      {
        id: "p2",
        title: "A Field Guide to Better Blog Titles",
        tag: "Notes",
        excerpt: "Most titles fail for one of three reasons. Here's how to catch them before you hit publish.",
        content: "Most weak titles fail for one of three reasons: they promise nothing, they promise too much, or they bury the actual subject under a clever phrase.\n\nBefore publishing, read your title next to your first paragraph. If they don't agree on what the post is about, rewrite one of them.",
        author: "Mara Ellison",
        authorId: "u1",
        date: "2026-06-18"
      },
      {
        id: "p3",
        title: "Shipping a Personal Blog in a Weekend",
        tag: "Build",
        excerpt: "You don't need a CMS, a build pipeline, or a database. You need a folder and an evening.",
        content: "You don't need a CMS, a build pipeline, or a database to start. You need a folder, a text editor, and an evening.\n\nStart with one page. Add a second when the first one is true to how you actually write. Everything else — comments, tags, search — can wait until the blog has enough posts to need it.",
        author: "Mara Ellison",
        authorId: "u1",
        date: "2026-05-27"
      }
    ];
    localStorage.setItem(DB_POSTS, JSON.stringify(posts));
  }
}

/* ---------- data access ---------- */
function getUsers() { return JSON.parse(localStorage.getItem(DB_USERS) || "[]"); }
function saveUsers(users) { localStorage.setItem(DB_USERS, JSON.stringify(users)); }

function getPosts() {
  return JSON.parse(localStorage.getItem(DB_POSTS) || "[]")
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}
function savePosts(posts) { localStorage.setItem(DB_POSTS, JSON.stringify(posts)); }

/* ---------- session ---------- */
function getCurrentUser() {
  const id = localStorage.getItem(DB_SESSION);
  if (!id) return null;
  return getUsers().find(u => u.id === id) || null;
}
function setSession(userId) { localStorage.setItem(DB_SESSION, userId); }
function clearSession() { localStorage.removeItem(DB_SESSION); }

function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}

function logout() {
  clearSession();
  window.location.href = "index.html";
}

/* ---------- nav rendering ---------- */
function initNav(activePage) {
  const nav = document.getElementById("primary-nav");
  if (!nav) return;
  const user = getCurrentUser();

  const links = [];
  links.push({ href: "index.html", label: "Home", key: "home" });
  if (user) {
    links.push({ href: "dashboard.html", label: "Dashboard", key: "dashboard" });
    links.push({ href: "create-blog.html", label: "Create Blog", key: "create" });
  } else {
    links.push({ href: "login.html", label: "Log in", key: "login" });
    links.push({ href: "register.html", label: "Sign up", key: "register", btn: true });
  }

  nav.innerHTML = links.map(l =>
    `<a href="${l.href}" class="${l.key === activePage ? "active" : ""} ${l.btn ? "btn btn-sm btn-accent" : ""}">${l.label}</a>`
  ).join("");

  if (user) {
    const logoutLink = document.createElement("a");
    logoutLink.href = "#";
    logoutLink.textContent = "Log out";
    logoutLink.addEventListener("click", (e) => { e.preventDefault(); logout(); });
    nav.appendChild(logoutLink);
  }

  const toggle = document.getElementById("nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
  }
}

document.addEventListener("DOMContentLoaded", seedIfEmpty);
