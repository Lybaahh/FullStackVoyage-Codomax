/* ===========================================================
   INKWELL — shared app logic
   Data now lives on the backend (Node.js + Express REST API).
   Only the session (JWT token + logged-in user) is cached in
   localStorage, so the UI doesn't have to hit the network just
   to know who's logged in.
   =========================================================== */

// If this page was opened directly as a file (double-clicked, file:// URL),
// a relative "/api" path has nothing to resolve against — point straight
// at the backend instead. When the page IS served by the backend
// (http://localhost:3000/...), the relative path still works fine.
const API_BASE = (window.location.protocol === "file:")
  ? "http://localhost:3000/api"
  : "/api";
const DB_SESSION = "inkwell_session"; // { token, user: {id,name,email} }

/* ---------- low-level API helper ---------- */
async function apiFetch(path, options = {}) {
  const session = getSession();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (session && session.token) headers.Authorization = "Bearer " + session.token;

  const res = await fetch(API_BASE + path, { ...options, headers });
  let data = null;
  try { data = await res.json(); } catch (_) { /* no body */ }

  if (!res.ok) {
    const message = (data && data.message) || `Something went wrong (server responded with status ${res.status}). Please try again.`;
    throw new Error(message);
  }
  return data;
}

/* ---------- posts (backend-backed) ---------- */
async function getPosts() {
  return apiFetch("/posts");
}
async function getPost(id) {
  return apiFetch("/posts/" + encodeURIComponent(id));
}
async function createPost(payload) {
  return apiFetch("/posts", { method: "POST", body: JSON.stringify(payload) });
}
async function updatePost(id, payload) {
  return apiFetch("/posts/" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify(payload) });
}
async function deletePost(id) {
  return apiFetch("/posts/" + encodeURIComponent(id), { method: "DELETE" });
}

/* ---------- auth (backend-backed) ---------- */
async function registerUser(name, email, password) {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password })
  });
  setSession(data.token, data.user);
  return data.user;
}

async function loginUser(email, password) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  setSession(data.token, data.user);
  return data.user;
}

/* ---------- session ---------- */
function getSession() {
  try { return JSON.parse(localStorage.getItem(DB_SESSION)); }
  catch (_) { return null; }
}
function setSession(token, user) {
  localStorage.setItem(DB_SESSION, JSON.stringify({ token, user }));
}
function clearSession() { localStorage.removeItem(DB_SESSION); }

function getCurrentUser() {
  const session = getSession();
  return session ? session.user : null;
}

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
