import React, { useState } from "react";
import styles from "./InfoModal.module.css";
import { X, Send, CheckCircle2 } from "lucide-react";
import { submitSupportMessage } from "../api/supportService";

export default function InfoModal({ type, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill out all required fields.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await submitSupportMessage(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (type) {
      case "privacy":
        return (
          <>
            <h2>Privacy Policy</h2>
            <div className={styles.goldDivider}></div>
            <div className={styles.scrollContent}>
              <p><em>Last Updated: May 2026</em></p>
              <p>Welcome to Gretora. We value your privacy and are committed to protecting your personal data and uploaded video files.</p>
              
              <h4>1. Information We Collect</h4>
              <p>We collect minimal information to provide our services:</p>
              <ul>
                <li><strong>Account Details:</strong> Your name and email address when you register.</li>
                <li><strong>Video Content:</strong> Video files that you upload are stored securely on our video hosting servers.</li>
                <li><strong>Scans Telemetry:</strong> Anonymized country code geolocation logs when someone scans your QR code. We never collect recipient personal information.</li>
              </ul>

              <h4>2. How We Protect Your Videos</h4>
              <p>Every greeting has a uniquely generated UUID that acts as a secure key. Your videos are not publicly indexed by search engines. They can only be accessed by scanning the physical QR code or visiting the randomized private link.</p>

              <h4>3. Data Retention</h4>
              <p>You have full control over your data. You can delete any greeting card from your dashboard at any time. Deleting a card instantly deletes it and permanently removes the video file from our hosting servers.</p>

              <h4>4. Cookies & Ad Networks</h4>
              <p>We use essential cookies to maintain secure authentication sessions. Non-intrusive ad networks may serve ads on user dashboards to fund free hosting. Ads are never displayed on public recipient watch pages.</p>
            </div>
          </>
        );

      case "terms":
        return (
          <>
            <h2>Terms of Service</h2>
            <div className={styles.goldDivider}></div>
            <div className={styles.scrollContent}>
              <p><em>Last Updated: May 2026</em></p>
              <p>By using Gretora, you agree to comply with and be bound by the following terms of service.</p>
              
              <h4>1. Eligibility & Registration</h4>
              <p>You must create an account to generate greeting cards. You agree to provide accurate registration details and maintain the security of your authentication sessions.</p>

              <h4>2. Permissible Video Uploads</h4>
              <p>You retain full copyright of your uploaded video messages. However, you are solely responsible for ensuring your content complies with safety guidelines. You strictly agree not to upload content that:</p>
              <ul>
                <li>Is illegal, threatening, defamatory, or extremely offensive.</li>
                <li>Violates third-party intellectual property or copyright laws.</li>
                <li>Contains explicit adult material or incites violence.</li>
              </ul>

              <h4>3. Content Review & Safety Banning</h4>
              <p>Gretora operates on a strict content-safety policy. If a recipient reports a greeting for violating guidelines, our administration team reserves the right to review the flagged video, block the content, and permanently suspend/ban the creator account without warning.</p>

              <h4>4. Disclaimer of Liability</h4>
              <p>Gretora does not endorse or take responsibility for user-generated videos. By using our site, you agree that Gretora is not liable for any content shared, and you use the service at your own discretion.</p>
            </div>
          </>
        );

      case "contact":
        return (
          <>
            <h2>Contact Support</h2>
            <div className={styles.goldDivider}></div>
            
            {submitted ? (
              <div className={styles.successScreen}>
                <CheckCircle2 size={56} className={styles.successIcon} />
                <h3>Message Sent Successfully!</h3>
                <p>Thank you for reaching out. A Gretora support representative will review your query and respond via email within 24 hours.</p>
                <button className={styles.closeModalBtn} onClick={onClose}>
                  Done
                </button>
              </div>
            ) : (
              <div className={styles.scrollContent}>
                <form onSubmit={handleFormSubmit} className={styles.form} style={{ paddingBottom: "10px" }}>
                  <p className={styles.formHint}>
                    Have a question or need help with your greetings? Drop us a message below or email directly to <a href="mailto:support@Gretora.com">support@Gretora.com</a>.
                  </p>

                  {error && <div className={styles.errorBox}>{error}</div>}

                  <div className={styles.formGroup}>
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      placeholder="e.g. Account recovery, custom seals"
                      value={formData.subject}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="message">Your Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      required
                      placeholder="How can we help you today?"
                      value={formData.message}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? (
                      "Sending query..."
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>
        <div className={styles.body}>{renderContent()}</div>
      </div>
    </div>
  );
}


