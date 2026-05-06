import { QRCode } from "react-qr-code";
import styles from "./QrGreeting.module.css";

console.log(QRCode);

export default function QrCard({ qrUrl, recipientName, occasion, message }) {

  if (!qrUrl) {
    return <div className={styles.placeholder}>QR Preview</div>;
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `A special ${occasion || "greeting"} for ${recipientName || "you"}! ` +
      `Watch the video here: ${qrUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      alert("Link copied to clipboard!");
    } catch {
      alert("Copy failed. Please copy manually: " + qrUrl);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.wrapper}>

      {/* SUCCESS PILL */}
      <div className={styles.successPill}>
        <span className={styles.dot}></span>
        Greeting Ready
      </div>

      {/* PRINTABLE CARD */}
      <div className={styles.greetingCard} id="printable-card">

        {/* TOP BAND */}
        <div className={styles.topBand}>
          <p className={styles.occasionLabel}>
            {occasion || "Special Occasion"}
          </p>
          <h2 className={styles.recipientName}>
            For <em>{recipientName || "You"}</em>
          </h2>
        </div>

        {/* CARD BODY */}
        <div className={styles.cardBody}>

          {/* QR SIDE */}
          <div className={styles.qrSide}>
            <a
              href={qrUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.qrFrame}
              title="Scan or click to watch video"
            >
              <QRCode
                value={qrUrl}
                size={110}
                bgColor="#ffffff"
                fgColor="#1a1a2e"
              />
              <div className={styles.playOverlay}>
                <span className={styles.playIcon}></span>
              </div>
            </a>
            <p className={styles.qrHint}>Scan to watch the video</p>
          </div>

          {/* MESSAGE SIDE */}
          <div className={styles.messageSide}>
            <div className={styles.divider}>
              <span className={styles.dividerLine}></span>
              <span className={styles.dividerDiamond}></span>
              <span className={styles.dividerLine}></span>
            </div>
            <p className={styles.messageText}>
              "{message || "Wishing you happiness, love and unforgettable memories on your special day."}"
            </p>
            <p className={styles.fromLabel}>With love &amp; warm wishes</p>
          </div>

        </div>

        {/* CARD FOOTER */}
        <div className={styles.cardFooter}>
          <span className={styles.brandMark}>
            Scan<em>dy</em>
          </span>
          <span className={styles.scanCta}>Scan QR to play video</span>
        </div>

      </div>

      {/* ACTION BUTTONS — hidden on print */}
      <div className={styles.actionsRow}>

        <button
          className={`${styles.actionBtn} ${styles.whatsapp}`}
          onClick={handleShareWhatsApp}
        >
          <WhatsAppIcon />
          Share on WhatsApp
        </button>

        <button
          className={styles.actionBtn}
          onClick={handleCopyLink}
        >
          <LinkIcon />
          Copy link
        </button>

        <button
          className={`${styles.actionBtn} ${styles.dark}`}
          onClick={handlePrint}
        >
          <PrintIcon />
          Print card
        </button>

      </div>

    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}