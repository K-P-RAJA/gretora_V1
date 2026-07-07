import { ShieldAlert, LogOut, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../api/authService";
import styles from "./SuspendedPage.module.css";

export default function SuspendedPage() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logoutUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      // Fallback
      localStorage.clear();
      navigate("/login");
    }
  }

  return (
    <div className={styles.page}>
      {/* Ambient background light */}
      <div className={styles.glow}></div>

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconWrap}>
            <ShieldAlert size={48} />
          </div>

          <h1 className={styles.title}>Account Suspended</h1>
          
          <div className={styles.divider}></div>
          
          <p className={styles.message}>
            Access to this Gretora account has been permanently suspended due to violation of our community standards, policy terms, or safety guidelines.
          </p>

          <div className={styles.infoBlock}>
            <Mail size={16} className={styles.mailIcon} />
            <span>Need assistance? Contact support at: </span>
            <a href="mailto:support@Gretora.com" className={styles.supportLink}>support@Gretora.com</a>
          </div>

          <div className={styles.actions}>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <LogOut size={16} />
              <span>Sign Out / Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


