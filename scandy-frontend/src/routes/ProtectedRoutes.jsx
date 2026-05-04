import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../api/authService";

export default function ProtectedRoute({ children }) {
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

  if (loading) return <div>Loading...</div>;

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}