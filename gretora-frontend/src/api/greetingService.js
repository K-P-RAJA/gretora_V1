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

export async function updateGreeting(id, payload) {
  return await apiRequest(`/greetings/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function reportGreeting(id, reason, details) {
  return await apiRequest(`/greetings/${id}/report`, {
    method: "POST",
    body: JSON.stringify({ reason, details }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}