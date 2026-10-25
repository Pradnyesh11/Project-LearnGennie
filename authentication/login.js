import { supabase, isConfigured, CONFIG_MESSAGE, safeNext } from "../js/supabase.js";

const form = document.getElementById("form");
const errorEl = document.getElementById("error-message");
const submitBtn = document.getElementById("login");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorEl.textContent = "";

  const email = document.getElementById("email-input").value.trim();
  const password = document.getElementById("password-input").value;

  const errors = [];
  if (!email) errors.push("Email required");
  if (!password) errors.push("Password required");
  if (errors.length > 0) {
    errorEl.textContent = errors.join(". ");
    return;
  }

  if (!isConfigured) {
    errorEl.textContent = CONFIG_MESSAGE;
    return;
  }

  submitBtn.disabled = true;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  submitBtn.disabled = false;

  if (error) {
    errorEl.textContent =
      error.message === "Invalid login credentials" ? "Invalid email or password" : error.message;
    return;
  }

  const next = new URLSearchParams(location.search).get("next");
  location.href = safeNext(next, "home.html");
});
