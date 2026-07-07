import API_BASE_URL from "../api/api";

export async function apiRequest(path, options = {}) {

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
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
    throw new Error(
      data?.statusMessage ||
      data?.message ||
      "API error"
    );
  }

  return data;
}