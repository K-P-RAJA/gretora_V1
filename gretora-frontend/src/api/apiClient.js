import API_BASE_URL from "../api/api";
import { supabase } from "../api/supabaseClient";

export async function apiRequest(path, options = {}) {
  let token = null;

  try {
    const { data } = await supabase.auth.getSession();
    token = data?.session?.access_token || localStorage.getItem("token");
  } catch (err) {
    console.error("Failed to retrieve token from Supabase session:", err);
    token = localStorage.getItem("token");
  }

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };

  // ✅ Only set JSON header if body is NOT FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const error = new Error(
      data?.statusMessage ||
      data?.message ||
      "API error"
    );
    error.status = res.status;
    throw error;
  }

  return data;
}