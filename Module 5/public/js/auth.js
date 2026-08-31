/* ---------- login ---------- */
function initLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("form-msg");
    const submitBtn = form.querySelector('button[type="submit"]');
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;

    msg.className = "form-msg";
    if (submitBtn) submitBtn.disabled = true;

    try {
      await loginUser(email, password);
      msg.textContent = "Welcome back — redirecting to your dashboard.";
      msg.className = "form-msg success show";
      setTimeout(() => { window.location.href = "dashboard.html"; }, 500);
    } catch (err) {
      showError(msg, err.message || "That email and password don't match our records.");
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

/* ---------- register ---------- */
function initRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("form-msg");
    const submitBtn = form.querySelector('button[type="submit"]');
    msg.className = "form-msg";

    const name = form.name.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const confirm = form.confirm.value;

    if (name.length < 2) return showError(msg, "Enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return showError(msg, "Enter a valid email address.");
    if (password.length < 6) return showError(msg, "Password needs at least 6 characters.");
    if (password !== confirm) return showError(msg, "Passwords don't match.");

    if (submitBtn) submitBtn.disabled = true;

    try {
      await registerUser(name, email, password);
      msg.textContent = "Account created — redirecting to your dashboard.";
      msg.className = "form-msg success show";
      setTimeout(() => { window.location.href = "dashboard.html"; }, 500);
    } catch (err) {
      showError(msg, err.message || "An account with that email already exists.");
      if (submitBtn) submitBtn.disabled = false;
    }
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
