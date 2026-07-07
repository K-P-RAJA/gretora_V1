import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated, getToken } from "../api/authService";
import { apiRequest } from "../api/apiClient";
import PolicyConsentModal from "../components/PolicyConsentModal";
import LoadingScreen from "../components/LoadingScreen";

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
    return <LoadingScreen message="Verifying session..." />;
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

