import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../api/authService";

/**
 * PublicRoute — wraps pages that should only be visible to
 * UNAUTHENTICATED users (e.g. /login, /).
 * If the user is already logged in, redirect them to /home.
 */
export default function PublicRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const result = await isAuthenticated();
      setAuth(result);
      setLoading(false);
    }
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #1a1136, #2c1f6e, #3b2a8c)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -100, right: -100,
          width: 400, height: 400, borderRadius: "50%",
          background: "rgba(108,71,255,0.25)", filter: "blur(90px)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 20,
        }}>
          <div style={{
            width: 52, height: 52,
            borderRadius: "50%",
            border: "3px solid rgba(108,71,255,0.25)",
            borderTop: "3px solid #8b6bff",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 14, fontWeight: 500,
            letterSpacing: "0.04em",
          }}>
            Loading…
          </p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Already logged in → send to the app
  if (auth) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
