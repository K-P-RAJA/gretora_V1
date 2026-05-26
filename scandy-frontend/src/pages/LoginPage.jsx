import { useState } from "react";
import styles from "./LoginPage.module.css";

import { loginUser, sendPasswordReset, loginWithGoogle } from "../api/authService";
import { useNavigate } from "react-router-dom";
import { createProfile, getProfile } from "../api/UserService";
import InfoModal from "../components/InfoModal";

export default function LoginPage() {
  const [step, setStep] = useState("login"); // "login" | "setup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [pendingUser, setPendingUser] = useState(null);
  const [error, setError] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.session.access_token);

      const profile = await getProfile();

      if (profile.statusCode === 1) {
        navigate("/home");
      } else {
        setPendingUser(data.user);
        setStep("setup");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await createProfile({
        id: pendingUser.id,
        name: name.trim(),
        email: pendingUser.email,
      });
      navigate("/home");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSuccessMessage("Success! Check your email for a secure password reset link.");
    } catch (err) {
      setError(err.message || "Failed to send password recovery email.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || "Failed to initialize Google Sign In.");
    } finally {
      setLoading(false);
    }
  };

  const GIFT_CATEGORIES = [
    { emoji: "🎂", colorClass: styles.icAmber, title: "Birthdays",  sub: "Surprise them with a video anthology" },
    { emoji: "💍", colorClass: styles.icRed,   title: "Weddings",   sub: "Memories from every guest" },
    { emoji: "🎓", colorClass: styles.icTeal,  title: "Milestones", sub: "Graduations, retirements & more" },
  ];

  const STATS = [
    { value: "48K+", label: "Gifts sent" },
    { value: "4.9★", label: "Avg rating" },
    { value: "120+", label: "Countries" },
  ];

  return (
    <div className={styles.page}>

      {/* ── LEFT PANEL ── */}
      <div className={styles.left}>
        <div className={styles.glow1} />
        <div className={styles.glow2} />

        <div className={styles.brand}>
          <div className={styles.brandName}>Scan<em>dy</em></div>
          <div className={styles.brandTag}>Video gifting platform</div>
        </div>

        <div className={styles.leftMid}>
          <p className={styles.headline}>
            Turn any moment into a gift they&apos;ll <em>never forget.</em>
          </p>
          <div className={styles.giftCards}>
            {GIFT_CATEGORIES.map((c) => (
              <div className={styles.giftCard} key={c.title}>
                <div className={`${styles.gcIcon} ${c.colorClass}`}>{c.emoji}</div>
                <div className={styles.gcTitle}>{c.title}</div>
                <div className={styles.gcSub}>{c.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.leftFoot}>
          {STATS.map((s, i) => (
            <div key={s.label} className={styles.statGroup}>
              {i > 0 && <div className={styles.sep} />}
              <div className={styles.stat}>
                <span className={styles.statN}>{s.value}</span>
                <span className={styles.statL}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className={styles.right}>
        <div className={styles.card}>
          <div className={styles.cardGlow} />

          {/* ── LOGIN STEP ── */}
          {step === "login" && (
            <>
              <div className={styles.cardLogo}>Scan<em>dy</em></div>
              <div className={styles.cardHead}>Welcome back</div>
              <div className={styles.cardSub}>
                Sign in to create or manage your video gifts.
              </div>

              <div className={styles.pills}>
                {["Weddings", "Birthdays", "Graduations"].map((p) => (
                  <span className={styles.pill} key={p}>{p}</span>
                ))}
              </div>

              {error && <div className={styles.errBox}>{error}</div>}

              <button 
                className={styles.gBtn} 
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg width="17" height="17" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
                Continue with Google
              </button>

              <div className={styles.divider}>
                <div className={styles.divLine} />
                <span className={styles.divTxt}>or sign in with email</span>
                <div className={styles.divLine} />
              </div>

              <div className={styles.field}>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>

              <div className={styles.forgotRow}>
                <button 
                  className={styles.forgot} 
                  type="button"
                  onClick={() => { setStep("forgot"); setError(""); setSuccessMessage(""); }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                className={`${styles.submitBtn}${loading ? ` ${styles.loading}` : ""}`}
                onClick={handleLogin}
                disabled={loading}
                type="button"
              >
                {loading ? "Signing in…" : "Continue →"}
              </button>

              <div className={styles.footerLink}>
                New to Scandy?{" "}
                <button type="button">Create your first gift</button>
              </div>

              <div className={styles.legal}>
                By continuing you agree to our{" "}
                <a href="#terms" onClick={(e) => { e.preventDefault(); setActiveModal("terms"); }}>Terms of Service</a> and <a href="#privacy" onClick={(e) => { e.preventDefault(); setActiveModal("privacy"); }}>Privacy Policy</a>.
              </div>
            </>
          )}

          {/* ── SETUP STEP ── */}
          {step === "setup" && (
            <>
              <div className={styles.setupIcon}>👋</div>
              <div className={styles.cardHead}>One last thing</div>
              <div className={styles.cardSub}>
                What should we call you? This is how your name will appear on gifts you create.
              </div>

              {error && <div className={styles.errBox}>{error}</div>}

              <div className={styles.field}>
                <label>Your name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSetup()}
                  autoFocus
                />
              </div>

              <div className={styles.setupHint}>
                You can always change this later in your profile settings.
              </div>

              <button
                className={`${styles.submitBtn}${loading ? ` ${styles.loading}` : ""}`}
                onClick={handleSetup}
                disabled={loading}
                type="button"
              >
                {loading ? "Setting up…" : "Let's go →"}
              </button>

              <button
                className={styles.backBtn}
                onClick={() => { setStep("login"); setError(""); }}
                type="button"
              >
                ← Back to sign in
              </button>
            </>
          )}

          {/* ── FORGOT STEP ── */}
          {step === "forgot" && (
            <>
              <div className={styles.cardLogo}>Scan<em>dy</em></div>
              <div className={styles.cardHead}>Reset password</div>
              <div className={styles.cardSub}>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </div>

              {error && <div className={styles.errBox}>{error}</div>}
              {successMessage && <div className={styles.successBox} style={{
                background: "rgba(52, 211, 153, 0.08)",
                border: "1px solid rgba(52, 211, 153, 0.3)",
                color: "var(--accent-teal)",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                fontSize: "13px",
                lineHeight: "1.5",
                marginBottom: "20px"
              }}>{successMessage}</div>}

              <div className={styles.field}>
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
                  autoFocus
                />
              </div>

              <button
                className={`${styles.submitBtn}${loading ? ` ${styles.loading}` : ""}`}
                onClick={handleForgotPassword}
                disabled={loading}
                type="button"
                style={{ marginTop: "12px" }}
              >
                {loading ? "Sending link…" : "Send Reset Link"}
              </button>

              <button
                className={styles.backBtn}
                onClick={() => { setStep("login"); setError(""); setSuccessMessage(""); }}
                type="button"
              >
                ← Back to sign in
              </button>
            </>
          )}
        </div>
      </div>
      {activeModal && (
        <InfoModal type={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}