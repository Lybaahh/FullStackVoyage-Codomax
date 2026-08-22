/* ---------- login ---------- */
function initLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = document.getElementById("form-msg");
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;

    const user = getUsers().find(u => u.email.toLowerCase() === email);

    if (!user || user.password !== password) {
      msg.textContent = "That email and password don't match our records.";
      msg.className = "form-msg error show";
      return;
    }

    setSession(user.id);
    msg.textContent = "Welcome back — redirecting to your dashboard.";
    msg.className = "form-msg success show";
    setTimeout(() => { window.location.href = "dashboard.html"; }, 500);
  });
}

/* ---------- register ---------- */
function initRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = document.getElementById("form-msg");
    msg.className = "form-msg";

    const name = form.name.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const confirm = form.confirm.value;

    if (name.length < 2) return showError(msg, "Enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return showError(msg, "Enter a valid email address.");
    if (password.length < 6) return showError(msg, "Password needs at least 6 characters.");
    if (password !== confirm) return showError(msg, "Passwords don't match.");

    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email)) {
      return showError(msg, "An account with that email already exists.");
    }

    const newUser = { id: "u" + Date.now(), name, email, password };
    users.push(newUser);
    saveUsers(users);
    setSession(newUser.id);

    msg.textContent = "Account created — redirecting to your dashboard.";
    msg.className = "form-msg success show";
    setTimeout(() => { window.location.href = "dashboard.html"; }, 500);
  });
}

function showError(msgEl, text) {
  msgEl.textContent = text;
  msgEl.className = "form-msg error show";
}

document.addEventListener("DOMContentLoaded", () => {
  initLoginForm();
  initRegisterForm();
});
