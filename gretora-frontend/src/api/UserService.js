import { apiRequest } from "./apiClient";

// 👤 GET PROFILE
export async function getProfile() {
  const profileData = await apiRequest("/Login/GetProfile");
  console.log(profileData);
  return profileData 
}

// ➕ CREATE PROFILE
export async function createProfile(profileData) {
  return await apiRequest("/Login/CreateProfile", {
    method: "POST",
    body: JSON.stringify(profileData),
  });
}

// ✏️ UPDATE PROFILE
export async function updateProfile(name) {
  return await apiRequest("/Login/UpdateProfile", {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}

export async function getProfileDashboard() {
  return await apiRequest("/Login/profile/dashboard");
}

// 🗑️ PERMANENTLY DELETE ACCOUNT
export async function deleteAccount() {
  return await apiRequest("/Login/delete-account", {
    method: "POST"
  });
}