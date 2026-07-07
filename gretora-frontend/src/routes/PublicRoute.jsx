import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../api/authService";
import LoadingScreen from "../components/LoadingScreen";

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
    return <LoadingScreen message="Verifying credentials..." />;
  }

  // Already logged in → send to the app
  if (auth) {
    return <Navigate to="/home" replace />;
  }

  return children;
}


