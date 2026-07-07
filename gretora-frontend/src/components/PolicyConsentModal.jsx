import { useState } from "react";
import { useAlert } from "../context/AlertContext";
import styles from "./PolicyConsentModal.module.css";

export default function PolicyConsentModal({ onAccept }) {
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const handleAccept = async () => {
    setLoading(true);
    try {
      await onAccept();
    } catch (err) {
      console.error(err);
      await showAlert("Failed to accept policy. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h2>Content Policy & Terms</h2>
          <p className={styles.subtitle}>
            Before you get started, please review and accept our content policy.
          </p>
        </div>

        <div className={styles.policyBox}>
          <h4>📋 User Content Policy</h4>
          <ul>
            <li>
              <strong>Your Responsibility:</strong> You are solely responsible for any video, image, or text content you upload or share through Gretora.
            </li>
            <li>
              <strong>Prohibited Content:</strong> Content that is illegal, obscene, harassing, threatening, defamatory, or violates the rights of others is strictly prohibited.
            </li>
            <li>
              <strong>No Liability:</strong> Gretora does not monitor, endorse, or take responsibility for user-generated content. By using our platform, you agree that Gretora shall not be held liable for any content uploaded by users.
            </li>
            <li>
              <strong>Content Removal:</strong> We reserve the right to remove any content that violates this policy and to terminate accounts of repeat offenders without prior notice.
            </li>
            <li>
              <strong>Reporting:</strong> If you encounter content that violates this policy, please use the "Report Misuse" button on the viewing page.
            </li>
          </ul>
        </div>

        <button
          className={styles.acceptBtn}
          onClick={handleAccept}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className={styles.spinner}></span>
              Processing...
            </>
          ) : (
            "I Agree & Continue"
          )}
        </button>

        <p className={styles.footerText}>
          By clicking "I Agree & Continue", you acknowledge that you have read, understood, and agree to abide by these terms.
        </p>
      </div>
    </div>
  );
}


