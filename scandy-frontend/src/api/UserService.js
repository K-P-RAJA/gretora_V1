import { apiRequest } from "./apiClient";

// 👤 GET PROFILE
export async function getProfile() {
  const data = await apiRequest("/Login/GetProfile");
  return data.data;
}

// ➕ CREATE PROFILE
export async function createProfile(name) {
  return await apiRequest("/Login/CreateProfile", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

// ✏️ UPDATE PROFILE
export async function updateProfile(name) {
  return await apiRequest("/Login/UpdateProfile", {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}