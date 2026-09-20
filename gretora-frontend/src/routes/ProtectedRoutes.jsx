import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated, logoutUser } from "../api/authService";
import { apiRequest } from "../api/apiClient";
import PolicyConsentModal from "../components/PolicyConsentModal";
import LoadingScreen from "../components/LoadingScreen";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(null); // null = unknown, true/false
  const [error, setError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    async function checkAuth() {
      setError(null);
      const result = await isAuthenticated();
      setAuth(result);

      if (result) {
        // Check if user has accepted policy / is banned
        try {
          const profile = await apiRequest("/Login/GetProfile", { method: "GET" });
          
          if (profile?.statusCode === 2 || profile?.statusCode === 3) {
            console.warn("Session invalid on backend:", profile.statusMessage);
            await logoutUser();
            setAuth(false);
            setLoading(false);
            return;
          }

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
          if (err.status === 401 || err.status === 403) {
            await logoutUser();
            setAuth(false);
          } else {
            setError(err.message || "Failed to establish database connection.");
          }
        }
      }

      setLoading(false);
    }
    checkAuth();
  }, [retryTrigger]);

  const handleAcceptPolicy = async () => {
    try {
      await apiRequest("/Login/accept-policy", { method: "POST" });
      setPolicyAccepted(true);
    } catch (err) {
      console.error("Failed to accept policy:", err);
      if (err.status === 401 || err.status === 403) {
        await logoutUser();
        setAuth(false);
      } else {
        throw err;
      }
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setRetryTrigger(prev => prev + 1);
  };

  if (loading) {
    return <LoadingScreen message="Verifying session..." />;
  }

  if (error) {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100vh",
        background: "#09080f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        color: "#fff",
        padding: "20px",
        boxSizing: "border-box"
      }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "24px",
          padding: "40px",
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          backdropFilter: "blur(20px)",
          boxShadow: "0 30px 70px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
        }}>
          <div style={{
            width: "56px",
            height: "56px",
            background: "rgba(236, 72, 153, 0.1)",
            border: "1px solid rgba(236, 72, 153, 0.2)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h2 style={{ fontSize: "22px", marginBottom: "12px", fontWeight: "700", letterSpacing: "-0.5px" }}>Something went wrong</h2>
          <p style={{ color: "rgba(255, 255, 255, 0.65)", fontSize: "14px", lineHeight: "1.6", marginBottom: "28px" }}>
            We were unable to load your account. Please try again or sign in once more.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button 
              onClick={handleRetry}
              style={{
                background: "linear-gradient(135deg, #7c6ef8 0%, #ec4899 100%)",
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(124, 110, 248, 0.4)"
              }}
            >
              Try Again
            </button>
            <button 
              onClick={async () => {
                await logoutUser();
                window.location.href = "/login";
              }}
              style={{
                background: "transparent",
                color: "rgba(255, 255, 255, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                padding: "12px 24px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
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

