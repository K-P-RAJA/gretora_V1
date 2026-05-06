import { apiRequest } from "./apiClient";

export async function createGreeting(payload) {
  return await apiRequest("/greetings", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
}