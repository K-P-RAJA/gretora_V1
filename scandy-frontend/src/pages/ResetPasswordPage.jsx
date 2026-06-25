import { useState, useEffect } from "react";
import { updatePassword } from "../api/authService";
import { supabase } from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css"; // Reuse premium login card styling!

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fail-safe: Manually parse the access token from the URL hash if Supabase client hasn't loaded it yet
  useEffect(() => {
    async function establishResetSession() {
      // Check if session is already active
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Fallback: Parse token manually from URL hash
        const hash = window.location.hash;
        if (hash) {
          const params = new URLSearchParams(hash.substring(1)); // remove '#'
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            try {
              const { data, error: setSessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (setSessionError) {
                console.error("Manual session set failed:", setSessionError);
                setError("Your password reset session has expired or is invalid. Please request a new link.");
              }
            } catch (err) {
              console.error("Error setting manual session:", err);
            }
          } else {
            setError("No active session found. Please click the reset link in your email again.");
          }
        } else {
          setError("No active session found. Please click the reset link in your email again.");
        }
      }
    }
    establishResetSession();
  }, []);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please complete both fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await updatePassword(newPassword);
      setSuccess("Success! Your password has been successfully updated.");
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setError(err.message || "Failed to update your password. Link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page} style={{ justifyContent: "center" }}>
      {/* ── CENTRALIZED FORM CARD ── */}
      <div className={styles.right} style={{ width: "100%", maxWidth: "460px", padding: 0 }}>
        <div className={styles.card}>
          <div className={styles.cardGlow} />
          
          <div className={styles.cardLogo}><span className="brandName">Gretora</span></div>
          <h2 className={styles.cardHead}>Create new password</h2>
          <p className={styles.cardSub}>
            Set a secure password for your Gretora account to restore access.
          </p>

          {error && <div className={styles.errBox}>{error}</div>}
          {success && (
            <div style={{
              background: "rgba(52, 211, 153, 0.08)",
              border: "1px solid rgba(52, 211, 153, 0.3)",
              color: "var(--accent-teal)",
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              fontSize: "13px",
              lineHeight: "1.5",
              marginBottom: "20px"
            }}>
              {success}
            </div>
          )}

          <div className={styles.field}>
            <label>New Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReset()}
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReset()}
            />
          </div>

          <button
            className={`${styles.submitBtn}${loading ? ` ${styles.loading}` : ""}`}
            onClick={handleReset}
            disabled={loading || !!success}
            type="button"
            style={{ marginTop: "16px" }}
          >
            {loading ? "Saving password…" : "Update Password"}
          </button>

          <button
            className={styles.backBtn}
            onClick={() => navigate("/login")}
            type="button"
            disabled={loading}
          >
            Cancel and Sign In
          </button>
        </div>
      </div>
    </div>
  );
}


