/* ---------- profile page ---------- */
function initProfilePage() {
  const form = document.getElementById("profile-form");
  if (!form) return; // not on the profile page — don't touch auth

  const user = requireAuth();
  if (!user) return;

  const avatarEl = document.getElementById("profile-avatar");
  if (avatarEl) avatarEl.textContent = user.name.trim().charAt(0).toUpperCase();

  form.name.value = user.name;
  form.email.value = user.email;

  const msg = document.getElementById("profile-msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const name = form.name.value.trim();
    const email = form.email.value.trim().toLowerCase();

    msg.className = "form-msg";

    if (name.length < 2) return showProfileMsg(msg, "Enter your full name.", true);
    if (!/^\S+@\S+\.\S+$/.test(email)) return showProfileMsg(msg, "Enter a valid email address.", true);

    if (submitBtn) submitBtn.disabled = true;
    try {
      const updated = await updateProfile(name, email);
      showProfileMsg(msg, "Profile updated.", false);
      const avatar = document.getElementById("profile-avatar");
      if (avatar) avatar.textContent = updated.name.trim().charAt(0).toUpperCase();
      initNav("profile"); // refresh nav in case name/session changed
    } catch (err) {
      showProfileMsg(msg, err.message || "Couldn't update your profile.", true);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  const passwordForm = document.getElementById("password-form");
  const passwordMsg = document.getElementById("password-msg");
  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = passwordForm.querySelector('button[type="submit"]');
      const currentPassword = passwordForm.currentPassword.value;
      const newPassword = passwordForm.newPassword.value;
      const confirmPassword = passwordForm.confirmPassword.value;

      passwordMsg.className = "form-msg";

      if (!currentPassword) return showProfileMsg(passwordMsg, "Enter your current password.", true);
      if (newPassword.length < 6) return showProfileMsg(passwordMsg, "New password needs at least 6 characters.", true);
      if (newPassword !== confirmPassword) return showProfileMsg(passwordMsg, "New passwords don't match.", true);

      if (submitBtn) submitBtn.disabled = true;
      try {
        await changePassword(currentPassword, newPassword);
        showProfileMsg(passwordMsg, "Password updated.", false);
        passwordForm.reset();
      } catch (err) {
        showProfileMsg(passwordMsg, err.message || "Couldn't update your password.", true);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
}

function showProfileMsg(msgEl, text, isError) {
  msgEl.textContent = text;
  msgEl.className = "form-msg " + (isError ? "error" : "success") + " show";
}

document.addEventListener("DOMContentLoaded", initProfilePage);
