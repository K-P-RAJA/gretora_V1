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

export async function getMyGreetings() {
  return await apiRequest("/greetings", {
    method: "GET",
  });
}

export async function deleteGreeting(id) {
  return await apiRequest(`/greetings/${id}`, {
    method: "DELETE",
  });
}