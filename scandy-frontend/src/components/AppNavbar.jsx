import { useNavigate, useLocation } from "react-router-dom";

import { logoutUser } from "../api/authService";

import styles from "./AppNavbar.module.css";

export default function AppNavbar() {
  const navigate = useNavigate();

  const location = useLocation();

  async function handleLogout() {
    try {
      await logoutUser();

      navigate("/login");
    } catch (err) {
      console.error(err);

      alert("Logout failed");
    }
  }

  return (
    <header className={styles.navbar}>
      {/* LEFT */}
      <div
        className={styles.logoWrap}
        onClick={() => navigate("/home")}
      >
        <div className={styles.logoIcon}>
          S
        </div>

        <div>
          <h1 className={styles.logo}>
            Scandy
          </h1>

          <p className={styles.logoSub}>
            QR Video Greetings
          </p>
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
    </header>
  );
}