import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../api/authService";
import { checkAdmin } from "../api/adminService";
import LoadingScreen from "../components/LoadingScreen";

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
    return <LoadingScreen message="Verifying admin access…" />;
  }

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminUser) {
    return <Navigate to="/home" replace />;
  }

  return children;
}


