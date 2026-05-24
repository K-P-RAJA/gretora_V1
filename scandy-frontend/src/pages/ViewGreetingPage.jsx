// ViewGreetingPage.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./ViewGreetingPage.module.css";
import { reportGreeting } from "../api/greetingService";
import { useAlert } from "../context/AlertContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ViewGreetingPage() {
  const { id } = useParams();
  const { showAlert } = useAlert();

  const [greeting, setGreeting] = useState(null);
  const [error, setError] = useState(false);

  // Report state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    async function fetchGreeting() {
      try {
        const res = await fetch(`${API_BASE_URL}/g/${id}`);

        if (!res.ok) {
          setError(true);
          return;
        }

        const data = await res.json();
        setGreeting(data);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    }

    fetchGreeting();
  }, [id]);

  const handleSubmitReport = async () => {
    if (!reportReason) {
      await showAlert("Please select a reason for reporting.", "warning");
      return;
    }
    setReportLoading(true);
    try {
      await reportGreeting(id, reportReason, reportDetails);
      setReportSubmitted(true);
    } catch (err) {
      console.error(err);
      await showAlert("Failed to submit report. Please try again.", "error");
    } finally {
      setReportLoading(false);
    }
  };

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#09090b",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -100, right: -100,
          width: 400, height: 400, borderRadius: "50%",
          background: "rgba(108,71,255,0.25)", filter: "blur(90px)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "relative", zIndex: 2,
          textAlign: "center", padding: "40px",
        }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🔍</div>
          <h2 style={{
            color: "#ffffff", fontSize: 28, fontWeight: 800,
            letterSpacing: "-0.5px", marginBottom: 12,
          }}>
            Greeting not found
          </h2>
          <p style={{
            color: "#a1a1aa", fontSize: 15,
            lineHeight: 1.7, marginBottom: 32, maxWidth: 360,
          }}>
            This greeting may have expired or been removed by the sender.
          </p>
          <a href="/" style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #6c47ff, #4f2fe8)",
            color: "white", textDecoration: "none",
            padding: "13px 32px", borderRadius: 14,
            fontSize: 15, fontWeight: 700,
            boxShadow: "0 4px 18px rgba(108,71,255,0.35)",
          }}>
            Go to Scandy →
          </a>
        </div>
      </div>
    );
  }

  if (!greeting) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Ambient Lights */}
      <div className={styles.glowOne}></div>
      <div className={styles.glowTwo}></div>
      <div className={styles.glowThree}></div>

      <div className={styles.container}>
        {/* Small Branding */}
        <div className={styles.brandBar}>
          <div className={styles.logo}>S</div>
          <div>
            <h4>Scandy</h4>
            <p>Premium Video Greetings</p>
          </div>
        </div>

        {/* Main Video Hero */}
        <div className={styles.heroCard}>
          {/* Animated Lid */}
          <div className={styles.giftLid}></div>

          {/* Sparkles */}
          <div className={styles.sparkle1}></div>
          <div className={styles.sparkle2}></div>
          <div className={styles.sparkle3}></div>

          {/* Floating Particles */}
          <div className={styles.particle1}></div>
          <div className={styles.particle2}></div>
          <div className={styles.particle3}></div>

          {/* Header */}
          <div className={styles.cardHeader}>
            <div className={styles.badge}>✨ Personalized Surprise</div>
            <div className={styles.live}>● Playing</div>
          </div>

          {/* Main Content */}
          <div className={styles.content}>
            <h1 className={styles.title}>{greeting.title}</h1>
            <p className={styles.message}>{greeting.message}</p>

            {/* Video */}
            <div className={styles.videoFrame}>
              <div className={styles.videoGlow}></div>
              <video controls autoPlay className={styles.video}>
                <source src={greeting.videoUrl} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>

        {/* Report Misuse Button */}
        <div className={styles.reportSection}>
          <button
            className={styles.reportBtn}
            onClick={() => setShowReportModal(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
              <line x1="4" y1="22" x2="4" y2="15"/>
            </svg>
            Report Misuse
          </button>
        </div>

        {/* Marketing AFTER Video */}
        <div className={styles.bottomSection}>
          <div className={styles.marketingCard}>
            <div className={styles.marketingBadge}>Made with Scandy</div>
            <h3>Turn memories into unforgettable gift experiences.</h3>
            <p>
              Create personalized QR video greetings for birthdays,
              anniversaries, surprises, and special moments.
            </p>
            <a href="/" className={styles.ctaButton}>
              Create Your Own Surprise
            </a>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className={styles.modalOverlay} onClick={() => !reportLoading && setShowReportModal(false)}>
          <div className={styles.reportModal} onClick={(e) => e.stopPropagation()}>
            {reportSubmitted ? (
              <div className={styles.reportSuccess}>
                <div className={styles.successIcon}>✓</div>
                <h3>Report Submitted</h3>
                <p>Thank you for helping us keep Scandy safe. Our team will review this content and take appropriate action.</p>
                <button className={styles.reportCloseBtn} onClick={() => { setShowReportModal(false); setReportSubmitted(false); }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className={styles.reportModalHeader}>
                  <h3>Report Content</h3>
                  <button className={styles.reportModalClose} onClick={() => setShowReportModal(false)}>✕</button>
                </div>
                <p className={styles.reportDesc}>
                  Help us keep Scandy safe. Select a reason for reporting this content.
                </p>

                <div className={styles.reportReasons}>
                  {["Inappropriate content", "Harassment or bullying", "Spam or misleading", "Harmful or dangerous", "Other"].map((reason) => (
                    <label key={reason} className={`${styles.reasonOption} ${reportReason === reason ? styles.reasonSelected : ""}`}>
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason}
                        checked={reportReason === reason}
                        onChange={(e) => setReportReason(e.target.value)}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                <textarea
                  className={styles.reportTextarea}
                  placeholder="Additional details (optional)..."
                  rows="3"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                />

                <button
                  className={styles.reportSubmitBtn}
                  onClick={handleSubmitReport}
                  disabled={reportLoading}
                >
                  {reportLoading ? "Submitting..." : "Submit Report"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}