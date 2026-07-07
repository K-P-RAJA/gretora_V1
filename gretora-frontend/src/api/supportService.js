import { apiRequest } from "./apiClient";

export async function submitSupportMessage(formData) {
  return await apiRequest("/support", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}
