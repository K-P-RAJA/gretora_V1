import React, { useRef, useState } from "react";
import { QRCode } from "react-qr-code";
import { toPng } from "html-to-image";
import styles from "../components/QrGreeting.module.css";

export default function LuxeQrCard({ qrUrl, recipientName, occasion, message }) {
  const cardRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!qrUrl) return <div className={styles.placeholder}>Awaiting Design...</div>;

  // Function to capture the card and share/download it
  const handleShareImage = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true, 
        pixelRatio: 3, // High quality for sharp QR codes
        backgroundColor: "#ffffff" 
      });
      
      const link = document.createElement('a');
      link.download = `Scandy_Gift_${recipientName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Capture failed", err);
    }
  };

  const handleQrClick = (e) => {
    e.preventDefault();
    setIsPlaying(true);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* THE ACTUAL CARD */}
      <div className={styles.luxeCard} ref={cardRef}>
        <div className={styles.cardContent}>
          
          {/* LEFT: PREMIUM BRANDING & MESSAGE */}
          <div className={styles.infoSide}>
            <div className={styles.brandHeader}>
              <span className={styles.tag}>EST. 2026</span>
              <span className={styles.brandLogo}>SCANDY<em>™</em></span>
            </div>

            <div className={styles.recipientBlock}>
              <p className={styles.smallLabel}>PREPARED EXCLUSIVELY FOR</p>
              <h1 className={styles.recipientName}>{recipientName || "Valued Guest"}</h1>
              <div className={styles.goldDivider}></div>
            </div>

            <div className={styles.messageBlock}>
              <p className={styles.messageText}>
                {message || "Wishing you an extraordinary experience filled with moments that matter."}
              </p>
            </div>

            <div className={styles.cardFooter}>
              <div className={styles.securityCode}>
                <span className={styles.dot}></span> AUTHENTIC DIGITAL ASSET
              </div>
              <div className={styles.occasionText}>{occasion || "SPECIAL OCCASION"}</div>
            </div>
          </div>

          {/* RIGHT: THE PRODUCT MEDALLION (QR/VIDEO) */}
          <div className={styles.productSide}>
            <div className={`${styles.displayFrame} ${isPlaying ? styles.videoActive : ""}`}>
              
              {!isPlaying ? (
                <a href={qrUrl} className={styles.qrInteraction} onClick={handleQrClick}>
                  <div className={styles.frameHeader}>SCAN OR TAP IMAGE</div>
                  <div className={styles.qrGlass}>
                    <QRCode
                      value={qrUrl}
                      size={140}
                      bgColor="transparent"
                      fgColor="#1a1a1a"
                      level="H"
                    />
                  </div>
                  <div className={styles.playHint}>
                    <span className={styles.playIcon}>▶</span>
                    REVEAL MESSAGE
                  </div>
                </a>
              ) : (
                <div className={styles.videoContainer}>
                  <iframe
                    src={qrUrl.replace("watch?v=", "embed/") + "?autoplay=1"}
                    title="Greeting Video"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    className={styles.videoPlayer}
                  ></iframe>
                  <button className={styles.closeBtn} onClick={() => setIsPlaying(false)}>
                    EXIT PLAYER
                  </button>
                </div>
              )}

              {/* FLOATING PRODUCT TAG */}
              <div className={styles.hologram}>
                LIMITED<br/>EDITION
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION CONTROLS */}
      <div className={styles.uiControls}>
        <button className={styles.shareBtn} onClick={handleShareImage}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
          Share as Image
        </button>
        <button className={styles.printBtn} onClick={() => window.print()}>
          Print PDF
        </button>
      </div>
    </div>
  );
}