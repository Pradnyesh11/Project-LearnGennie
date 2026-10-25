import { supabase, isConfigured, CONFIG_MESSAGE } from "../js/supabase.js";

const form = document.getElementById("form");
const errorEl = document.getElementById("error-message");
const infoEl = document.getElementById("info-message");
const submitBtn = document.getElementById("SignUpbtn");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorEl.textContent = "";
  infoEl.textContent = "";

  const name = document.getElementById("firstname-input").value.trim();
  const email = document.getElementById("email-input").value.trim();
  const password = document.getElementById("password-input").value;
  const repeat = document.getElementById("repeat-password-input").value;

  const errors = [];
  if (!name) errors.push("Firstname required");
  if (!email) errors.push("Email required");
  if (password.length < 8) errors.push("Password must be 8+ characters");
  if (password !== repeat) errors.push("Passwords must match");
  if (errors.length > 0) {
    errorEl.textContent = errors.join(". ");
    return;
  }

  if (!isConfigured) {
    errorEl.textContent = CONFIG_MESSAGE;
    return;
  }

  submitBtn.disabled = true;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }, // copied into the profiles table by the database trigger
      emailRedirectTo: new URL("login.html", location.href).href,
    },
  });
  submitBtn.disabled = false;

  if (error) {
    errorEl.textContent = error.message;
    return;
  }

  // With email confirmation on, Supabase hides "already registered" by returning
  // a user with no identities instead of an error.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    errorEl.textContent = "Email already in use";
    return;
  }

  if (data.session) {
    // Email confirmation is off: the user is already signed in.
    location.href = "home.html";
    return;
  }

  form.reset();
  infoEl.textContent = "Account created. Check your email and click the confirmation link, then log in.";
});
