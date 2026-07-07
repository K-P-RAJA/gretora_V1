import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, Gift, User, Shield, LogOut } from "lucide-react";

import { logoutUser } from "../api/authService";
import { checkAdmin } from "../api/adminService";
import { useAlert } from "../context/AlertContext";

import styles from "./AppNavbar.module.css";

export default function AppNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    async function loadAdminStatus() {
      const status = await checkAdmin();
      setIsAdmin(status);
    }
    loadAdminStatus();
  }, []);

  async function handleLogout() {
    try {
      await logoutUser();

      navigate("/login");
    } catch (err) {
      console.error(err);

      await showAlert("Logout failed", "error");
    }
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* LEFT */}
        <div
          className={styles.logoWrap}
          onClick={() => navigate("/home")}
        >
          <div className={styles.logo}>
            <span className="brandName">Gretora</span>
          </div>
        </div>

        {/* CENTER */}
        <nav className={styles.navLinks}>
          <button
            className={
              location.pathname === "/home"
                ? styles.activeLink
                : styles.navLink
            }
            onClick={() => navigate("/home")}
          >
            <Home size={18} className={styles.navIcon} />
            <span>Home</span>
          </button>

          <button
            className={
              location.pathname ===
              "/mygreetings"
                ? styles.activeLink
                : styles.navLink
            }
            onClick={() =>
              navigate("/mygreetings")
            }
          >
            <Gift size={18} className={styles.navIcon} />
            <span>My Greetings</span>
          </button>

          <button
            className={
              location.pathname ===
              "/profile"
                ? styles.activeLink
                : styles.navLink
            }
            onClick={() =>
              navigate("/profile")
            }
          >
            <User size={18} className={styles.navIcon} />
            <span>Profile</span>
          </button>

          {isAdmin && (
            <button
              className={
                location.pathname.startsWith("/admin")
                  ? styles.activeLink
                  : styles.navLink
              }
              onClick={() => navigate("/admin")}
            >
              <Shield size={18} className={styles.navIcon} />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* RIGHT */}
        <div className={styles.actions}>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

