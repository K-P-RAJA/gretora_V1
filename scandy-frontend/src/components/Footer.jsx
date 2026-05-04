import styles from './Footer.module.css';

export default function Footer() {
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
            <li><a href="#how-it-works">How it works</a></li>
            <li><a href="#occasions">Occasions</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="/pricing">Pricing</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
          </ul>
        </div>

        <div>
          <div className={styles.footerColTitle}>Use cases</div>
          <ul className={styles.footerLinks}>
            <li><a href="/birthday-video-qr">Birthday QR gift</a></li>
            <li><a href="/wedding-video-qr">Wedding QR code</a></li>
            <li><a href="/graduation-gift">Graduation gift</a></li>
            <li><a href="/long-distance-gift">Long distance gift</a></li>
            <li><a href="/memorial-qr">Memorial QR code</a></li>
          </ul>
        </div>

        <div>
          <div className={styles.footerColTitle}>Company</div>
          <ul className={styles.footerLinks}>
            <li><a href="/about">About Scandy</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy">Privacy policy</a></li>
            <li><a href="/terms">Terms of service</a></li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p className={styles.footerCopy}>
          © 2026 Scandy. All rights reserved. Made with love in India. 🇮🇳
        </p>
        <div className={styles.footerLegal}>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
    </footer>
  );
}