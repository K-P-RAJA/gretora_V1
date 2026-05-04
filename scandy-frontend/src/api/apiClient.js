import API_BASE_URL from "../api/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  console.log(data);

  // ❌ actual HTTP failure
  if (!res.ok) {
    throw new Error(data.statusMessage || "API error");
  }

  return data;
}