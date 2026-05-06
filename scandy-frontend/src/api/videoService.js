import { apiRequest } from "./apiClient";

export async function uploadVideo(file) {

  const formData = new FormData();

  // ✅ MUST match backend property name
  formData.append("File", file);

  return await apiRequest("/videos/upload", {
    method: "POST",
    body: formData,
  });
}