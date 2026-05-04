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

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}