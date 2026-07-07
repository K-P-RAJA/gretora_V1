import { supabase } from "../api/supabaseClient";

// 🔐 LOGIN
export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  // ✅ STORE TOKEN FOR YOUR BACKEND
  const token = data.session.access_token;
  localStorage.setItem("token", token);

  return data;
}

export async function logoutUser() {
  await supabase.auth.signOut();

  // ✅ clear backend token
  localStorage.removeItem("token");
}

export function getToken() {
  return localStorage.getItem("token");
}

export async function isAuthenticated() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return false;

    // Keep localStorage token in sync with the live session
    localStorage.setItem("token", data.session.access_token);
    return true;
  } catch (err) {
    console.error("Auth check error:", err);
    return false;
  }
}

// 🔑 RESET PASSWORD - REQUEST LINK
export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
}

// 🔑 RESET PASSWORD - UPDATE
export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }
}

// 🌐 GOOGLE OAUTH SIGN IN
export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/home`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}