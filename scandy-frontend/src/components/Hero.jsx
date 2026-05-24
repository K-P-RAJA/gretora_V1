import { useEffect, useRef } from 'react';
import styles from './Hero.module.css';

export default function Hero() {
  const qrRef = useRef(null);

  useEffect(() => {
    if (!qrRef.current) return;
    const pattern = [1,1,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,1,1,0,1,0,1,1,0,1,1,0,1,0,1];
    pattern.forEach(v => {
      const dot = document.createElement('div');
      dot.className = styles.qrDot;
      dot.style.background = v ? '#111' : '#F0F0F0';
      qrRef.current.appendChild(dot);
    });
  }, []);

  return (
    <section className={styles.hero} aria-label="Hero section">
      <div className={styles.heroInner}>

        {/* LEFT */}
        <div className={styles.heroLeft}>
          <div className={styles.heroTag}>Video gifting, reimagined</div>

          <h1 className={styles.h1}>
            Turn any video<br />
            into a gift they<br />
            <em>scan forever.</em>
          </h1>

          <p className={styles.heroDesc}>
            Upload a video message — a birthday wish, wedding vow, or a heartfelt "I love you."
            Scandy instantly generates a unique QR code. Print it on any card, frame, or gift tag.
            Anyone who scans it watches your video, forever. No app needed.
          </p>

          <div className={styles.heroActions}>
            <button className={styles.btnPrimary} aria-label="Upload your free video now">
              Upload your video — it's free
            </button>
            <button className={styles.btnOutline} aria-label="See how Scandy works">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10,8 16,12 10,16" />
              </svg>
              See how it works
            </button>
          </div>

          <div className={styles.heroMetrics}>
            <div className={styles.metricItem}>
              <div className={styles.metricVal}>3</div>
              <div className={styles.metricLabel}>Free videos</div>
            </div>
            <div className={styles.metricItem}>
              <div className={styles.metricVal}>2 min</div>
              <div className={styles.metricLabel}>Max duration</div>
            </div>
            <div className={styles.metricItem}>
              <div className={styles.metricVal}>∞</div>
              <div className={styles.metricLabel}>Scans forever</div>
            </div>
          </div>
        </div>

        {/* RIGHT — Phone mockup */}
        <div className={styles.heroRight}>
          <div className={styles.phoneWrap}>
            <div className={styles.scanBadge}>Scan to watch</div>
            <div className={styles.phoneShell}>
              <div className={styles.phoneScreen}>
                <div className={styles.phonePill} />
                <div className={styles.phoneVideo}>
                  <div className={styles.playCircle}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <polygon points="6,4 20,12 6,20" fill="#D94F3D" />
                    </svg>
                  </div>
                </div>
                <div className={styles.phoneLabel}>Happy Birthday, Priya</div>
                <div className={styles.phoneSublabel}>0:45 · tap to play</div>
                <div className={styles.phoneBar}>
                  <div className={styles.phoneBarFill} />
                </div>
              </div>
            </div>
            <div className={styles.qrFloat}>
              <div className={styles.qrMiniGrid} ref={qrRef} />
              <div className={styles.qrFloatLabel}>scandy</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}