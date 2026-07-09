import API_BASE_URL from "./api";

/**
 * Log a caught client error to the backend log service.
 * @param {string} message The error summary message
 * @param {string} stackTrace The stack trace or detail
 * @param {object} context Additional context details
 */
export async function logClientError(message, stackTrace = "", context = {}) {
  try {
    const details = `Context: ${JSON.stringify(context)}\nStackTrace: ${stackTrace}`;
    const payload = {
      level: "ERROR",
      message: message,
      stackTrace: details,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    await fetch(`${API_BASE_URL}/logs/client`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error("Failed to submit client error log to server:", err);
  }
}
