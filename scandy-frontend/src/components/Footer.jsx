import React, { useState } from "react";
import styles from "./Footer.module.css";
import InfoModal from "./InfoModal";

export default function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  const handleOpenModal = (e, type) => {
    e.preventDefault();
    setActiveModal(type);
  };

  return (
    <footer className={styles.footer} aria-label="Site footer">
      <div className={styles.footerTop}>
        <div>
          <div className={styles.footerBrandName}>
            Scan<em>dy</em>
          </div>
          <div className={styles.footerTagline}>Your words. Their smile. One scan.</div>
          <p className={styles.footerDesc}>
            Scandy turns any video message into a scannable QR code gift — for every occasion
            worth celebrating. Free to start, forever to keep.
          </p>
        </div>

        <div>
          <div className={styles.footerColTitle}>Product</div>
          <ul className={styles.footerLinks}>
            <li><a href="/#how-it-works">How it works</a></li>
            <li><a href="/#occasions">Occasions</a></li>
            <li><a href="/#faq">FAQ</a></li>
            <li><a href="/#pricing">Pricing</a></li>
            <li><a href="/mygreetings">Dashboard</a></li>
          </ul>
        </div>

        <div>
          <div className={styles.footerColTitle}>Use Cases</div>
          <ul className={styles.footerLinks}>
            <li><a href="/#occasions">Birthday QR gift</a></li>
            <li><a href="/#occasions">Wedding QR code</a></li>
            <li><a href="/#occasions">Graduation gift</a></li>
            <li><a href="/#occasions">Long distance gift</a></li>
            <li><a href="/#occasions">Memorial QR code</a></li>
          </ul>
        </div>

        <div>
          <div className={styles.footerColTitle}>Company</div>
          <ul className={styles.footerLinks}>
            <li>
              <a href="#contact" onClick={(e) => handleOpenModal(e, "contact")}>
                Contact Support
              </a>
            </li>
            <li>
              <a href="#privacy" onClick={(e) => handleOpenModal(e, "privacy")}>
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#terms" onClick={(e) => handleOpenModal(e, "terms")}>
                Terms of Service
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p className={styles.footerCopy}>
          © 2026 Scandy. All rights reserved. Made with love in India. 🇮🇳
        </p>
        <div className={styles.footerLegal}>
          <a href="#privacy" onClick={(e) => handleOpenModal(e, "privacy")}>
            Privacy
          </a>
          <a href="#terms" onClick={(e) => handleOpenModal(e, "terms")}>
            Terms
          </a>
          <a href="#contact" onClick={(e) => handleOpenModal(e, "contact")}>
            Contact
          </a>
        </div>
      </div>

      {/* Glassmorphic Info Overlay Modals */}
      {activeModal && (
        <InfoModal type={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </footer>
  );
}