import { apiRequest } from "./apiClient";

export async function checkAdmin() {
  try {
    const res = await apiRequest("/admin/check", {
      method: "GET",
    });
    return res?.isAdmin || false;
  } catch (err) {
    console.error("Admin check failed:", err);
    return false;
  }
}

export async function getDashboardStats() {
  return await apiRequest("/admin/dashboard", {
    method: "GET",
  });
}

export async function getReports(status = "All") {
  const query = status && status !== "All" ? `?status=${encodeURIComponent(status)}` : "";
  return await apiRequest(`/admin/reports${query}`, {
    method: "GET",
  });
}

export async function updateReportStatus(id, status) {
  return await apiRequest(`/admin/reports/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function getUsers(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return await apiRequest(`/admin/users${query}`, {
    method: "GET",
  });
}

export async function toggleUserBan(id, isBanned) {
  return await apiRequest(`/admin/users/${id}/ban`, {
    method: "PUT",
    body: JSON.stringify({ isBanned }),
  });
}

export async function getGreetings(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return await apiRequest(`/admin/greetings${query}`, {
    method: "GET",
  });
}

export async function deleteGreetingAdmin(id) {
  return await apiRequest(`/admin/greetings/${id}`, {
    method: "DELETE",
  });
}

export async function getSupportTickets() {
  return await apiRequest("/admin/support", {
    method: "GET",
  });
}

export async function updateSupportTicket(id, status) {
  return await apiRequest(`/admin/support/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function deleteSupportTicket(id) {
  return await apiRequest(`/admin/support/${id}`, {
    method: "DELETE",
  });
}

export async function getSystemLogs(page = 1, pageSize = 50, level = "", source = "", search = "") {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    level,
    source,
    search
  });
  return await apiRequest(`/Admin/logs?${params.toString()}`, {
    method: "GET",
  });
}

