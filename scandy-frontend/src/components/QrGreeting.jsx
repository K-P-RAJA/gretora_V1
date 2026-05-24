import React, { useRef, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { useNavigate, useLocation } from "react-router-dom";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { ArrowLeft } from "lucide-react";
import styles from "../components/QrGreeting.module.css";

export default function LuxeQrCard({ qrUrl, recipientName, occasion, message }) {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);

  const isPublicView = location.pathname.startsWith('/g/');

  const handleWhatsAppShare = () => {
    // Relying on WhatsApp's built-in Link Previews (Open Graph) creates a perfect single-bubble message.
    const text = encodeURIComponent(`Hi ${recipientName || ''}! I've prepared a special digital greeting card just for you! 🎁✨\n\nTap the link below to open your card and reveal the surprise:\n${qrUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (!qrUrl) return <div className={styles.placeholder}>Awaiting Design...</div>;

  const handleShareImage = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true, 
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        filter: (node) => {
          if (node.tagName === 'IFRAME') return false; 
          return true;
        }
      });
      
      const link = document.createElement('a');
      link.download = `Scandy_Gift_${recipientName || 'Greeting'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Capture failed", err);
    }
  };

  const handleSharePdf = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        filter: (node) => {
          if (node.tagName === 'IFRAME') return false;
          return true;
        }
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const imgW = img.width;
      const imgH = img.height;

      // Create PDF matching the card's aspect ratio
      const pdfW = 210; // A4 width in mm
      const pdfH = (imgH / imgW) * pdfW;

      const pdf = new jsPDF({
        orientation: pdfW > pdfH ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfW, pdfH],
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfW, pdfH);

      // Add a clickable link overlay on the entire card
      pdf.link(0, 0, pdfW, pdfH, { url: qrUrl });

      pdf.save(`Scandy_Greeting_${recipientName || 'Card'}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    }
  };

  const handleQrClick = (e) => {
    if (isPublicView) {
      e.preventDefault();
      setIsPlaying(true);
    } else {
      try {
        const path = new URL(qrUrl).pathname;
        navigate(path);
      } catch (err) {
        window.location.href = qrUrl;
      }
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.cardContainer} ref={cardRef}>
        {/* The Card Background/Texture */}
        <div className={styles.cardInner}>
          
          {/* Left Page (Message & Details) */}
          <div className={styles.leftPage}>
            {/* Decorative Corner Ornaments */}
            <div className={`${styles.ornament} ${styles.topLeft}`}></div>
            <div className={`${styles.ornament} ${styles.topRight}`}></div>
            <div className={`${styles.ornament} ${styles.bottomLeft}`}></div>
            <div className={`${styles.ornament} ${styles.bottomRight}`}></div>

            <div className={styles.brandHeader}>
              <span className={styles.brandLogo}>Scandy</span>
              <span className={styles.tag}>Premium Greetings</span>
            </div>

            <div className={styles.recipientBlock}>
              <h2 className={styles.occasionText}>{occasion || "A Special Occasion"}</h2>
              <p className={styles.smallLabel}>FOR</p>
              <h1 className={styles.recipientName}>{recipientName || "Someone Special"}</h1>
              <div className={styles.goldDivider}></div>
            </div>

            <div className={styles.messageBlock}>
              <p className={styles.messageText}>
                {message || "Wishing you an extraordinary experience filled with moments that matter."}
              </p>
            </div>

            <div className={styles.waxSeal}>
              <span>S</span>
            </div>
          </div>

          {/* Right Page (QR Code / Video) */}
          <div className={styles.rightPage}>
            <div className={`${styles.displayFrame} ${isPlaying ? styles.videoActive : ""}`}>
              {!isPlaying ? (
                <a href={qrUrl} className={styles.qrInteraction} onClick={handleQrClick}>
                  <div className={styles.frameHeader}>Scan to Reveal</div>
                  
                  <div className={styles.qrGlass}>
                    <div className={styles.qrWrapper}>
                      <QRCode
                        value={qrUrl}
                        size={160}
                        bgColor="transparent"
                        fgColor="#2a1610"
                        qrStyle="dots"
                        eyeRadius={[10, 10, 10, 10]}
                        eyeColor="#b48c50"
                      />
                      {/* Center Logo on QR */}
                      <div className={styles.qrCenterLogo}>
                        ▶
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.playHint}>
                    Tap to open digital surprise
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
                    Close Video
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.uiControls}>
        {!isPublicView && (
          <button className={`${styles.shareBtn} ${styles.backBtn}`} onClick={() => navigate("/mygreetings")}>
            <ArrowLeft size={18} />
            Back to Greetings
          </button>
        )}
        <button className={`${styles.shareBtn} ${styles.whatsappBtn}`} onClick={handleWhatsAppShare}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          Send via WhatsApp
        </button>
        <button className={styles.shareBtn} onClick={handleShareImage}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
          Download Image
        </button>
        <button className={`${styles.shareBtn} ${styles.pdfBtn}`} onClick={handleSharePdf}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Share as PDF
        </button>
      </div>
    </div>
  );
}