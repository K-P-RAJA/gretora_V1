import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./theme.css";
import API_BASE_URL from "./api/api";

// Global frontend error capturing
window.addEventListener("error", (event) => {
  // Ignore minor browser extension errors
  if (event.message && (event.message.includes("Extension") || event.message.includes("inject"))) return;

  const payload = {
    level: "ERROR",
    message: event.message || "Unhandled Frontend Error",
    stackTrace: event.error?.stack || "",
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  fetch(`${API_BASE_URL}/logs/client`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(() => {}); // Suppress loop if logging api is offline
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const payload = {
    level: "ERROR",
    message: `Unhandled Promise Rejection: ${reason?.message || reason || "Unknown"}`,
    stackTrace: reason?.stack || "",
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  fetch(`${API_BASE_URL}/logs/client`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(() => {});
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

