import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated, getToken } from "../api/authService";
import { apiRequest } from "../api/apiClient";
import PolicyConsentModal from "../components/PolicyConsentModal";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(null); // null = unknown, true/false

  useEffect(() => {
    async function checkAuth() {
      const result = await isAuthenticated();
      setAuth(result);

      if (result) {
        // Check if user has accepted policy / is banned
        try {
          const profile = await apiRequest("/Login/GetProfile", { method: "GET" });
          
          if (profile?.data?.isBanned) {
            setIsBanned(true);
          }

          if (profile?.data?.hasAcceptedPolicy) {
            setPolicyAccepted(true);
          } else {
            setPolicyAccepted(false);
          }
        } catch (err) {
          console.error("Failed to check profile status:", err);
          setPolicyAccepted(false);
        }
      }

      setLoading(false);
    }
    checkAuth();
  }, []);

  const handleAcceptPolicy = async () => {
    await apiRequest("/Login/accept-policy", { method: "POST" });
    setPolicyAccepted(true);
  };

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
        {/* Glow blobs */}
        <div style={{
          position: "absolute", top: -100, right: -100,
          width: 400, height: 400, borderRadius: "50%",
          background: "rgba(108,71,255,0.25)", filter: "blur(90px)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -80,
          width: 300, height: 300, borderRadius: "50%",
          background: "rgba(139,107,255,0.18)", filter: "blur(80px)",
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
            border: "3px solid rgba(108,71,255,0.25)",
            borderTop: "3px solid #8b6bff",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 14, fontWeight: 500,
            letterSpacing: "0.04em",
          }}>
            Verifying session…
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

  if (isBanned) {
    return <Navigate to="/suspended" replace />;
  }

  // Show policy modal if user hasn't accepted yet
  if (policyAccepted === false) {
    return (
      <>
        {children}
        <PolicyConsentModal onAccept={handleAcceptPolicy} />
      </>
    );
  }

  return children;
}