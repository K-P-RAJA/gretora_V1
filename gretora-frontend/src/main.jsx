import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./theme.css";
import API_BASE_URL from "./api/api";

// Helper to check if an error is third-party / browser-internal noise
function isIgnorableError(msg, stack = "") {
  const str = `${msg} ${stack}`.toLowerCase();
  return (
    str.includes("extension") ||
    str.includes("inject") ||
    str.includes("lock:sb-") ||
    str.includes("stole it") ||
    str.includes("iabjs://") ||
    str.includes("postmessage") ||
    str.includes("java exception") ||
    str.includes("resizeobserver") ||
    str.includes("script error") ||
    str.includes("notfounderror") ||
    str.includes("invalidstateerror") ||
    str.includes("indexsizeerror")
  );
}

// Global frontend error capturing
window.addEventListener("error", (event) => {
  const msg = event.message || "";
  const stack = event.error?.stack || "";
  if (isIgnorableError(msg, stack)) return;

  const payload = {
    level: "ERROR",
    message: msg || "Unhandled Frontend Error",
    stackTrace: stack,
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  fetch(`${API_BASE_URL}/logs/client`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(() => {});
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const msg = reason?.message || String(reason || "");
  const stack = reason?.stack || "";

  if (isIgnorableError(msg, stack)) return;

  const payload = {
    level: "ERROR",
    message: `Unhandled Promise Rejection: ${msg || "Unknown"}`,
    stackTrace: stack,
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

