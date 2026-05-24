import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../api/authService";
import { checkAdmin } from "../api/adminService";

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    async function verifyAdmin() {
      const isAuth = await isAuthenticated();
      setAuth(isAuth);

      if (isAuth) {
        const isAdmin = await checkAdmin();
        setIsAdminUser(isAdmin);
      }
      setLoading(false);
    }
    verifyAdmin();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #0b071e, #130a2e, #1c0f42)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Glow blobs */}
        <div style={{
          position: "absolute", top: -100, right: -100,
          width: 400, height: 400, borderRadius: "50%",
          background: "rgba(108,71,255,0.15)", filter: "blur(120px)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -80,
          width: 300, height: 300, borderRadius: "50%",
          background: "rgba(139,107,255,0.1)", filter: "blur(100px)",
          pointerEvents: "none",
        }} />

        {/* Spinner */}
        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 20,
        }}>
          <div style={{
            width: 52, height: 52,
            borderRadius: "50%",
            border: "3px solid rgba(108,71,255,0.15)",
            borderTop: "3px solid #8b6bff",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "0.05em",
          }}>
            Verifying admin access…
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

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminUser) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
