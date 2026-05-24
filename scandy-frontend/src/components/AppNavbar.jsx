import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

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
            Scan<em>dy</em>
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
            Home
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
            My Greetings
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
            Profile
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
              Admin Panel
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