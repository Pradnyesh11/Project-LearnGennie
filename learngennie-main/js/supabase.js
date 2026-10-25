import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

// True once js/config.js has been filled in with real values.
export const isConfigured =
  !SUPABASE_URL.includes("YOUR-PROJECT-REF") && !SUPABASE_ANON_KEY.startsWith("YOUR-");

export const CONFIG_MESSAGE =
  "Supabase is not configured yet. Open js/config.js and add your project URL and anon key.";

// createClient() throws on an empty URL, so fall back to a harmless placeholder
// until the real values are set (isConfigured lets pages show a clear message).
export const supabase = createClient(
  isConfigured ? SUPABASE_URL : "https://placeholder.supabase.co",
  isConfigured ? SUPABASE_ANON_KEY : "placeholder-key"
);

// Returns the signed-in user, or null.
export async function getUser() {
  if (!isConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ? data.session.user : null;
}

// Use on pages that need an account. Redirects to login (and back afterwards)
// and returns null when nobody is signed in.
export async function requireLogin() {
  const user = await getUser();
  if (!user) {
    const next = location.pathname + location.search;
    location.href = "/authentication/login.html?next=" + encodeURIComponent(next);
    return null;
  }
  return user;
}

// Only allow same-site relative paths as a post-login destination,
// so a crafted ?next= link cannot send people to another website.
export function safeNext(raw, fallback) {
  if (typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\")) {
    return raw;
  }
  return fallback;
}

export async function signOut() {
  await supabase.auth.signOut();
  location.href = "/authentication/login.html";
}
