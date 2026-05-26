import React from "react";
import styles from "./PricingSection.module.css";

export default function PricingSection() {
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <section className={styles.pricingSection} id="pricing" aria-labelledby="pricing-title">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.badge}>Sleek & Transparent</div>
          <h2 id="pricing-title">
            Simple pricing, <span>made for memories</span>
          </h2>
          <p className={styles.lead}>
            Start sharing heartfelt surprise video cards today. No credit card required.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Card 1: Free Beta */}
          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.planBadge}>early backer access</div>
              <h3>Scandy Beta</h3>
              <p className={styles.planDesc}>Perfect to try out the magic of video greeting cards.</p>
              <div className={styles.priceWrap}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>0</span>
                <span className={styles.period}>/forever</span>
              </div>
            </div>

            <ul className={styles.features}>
              <li>
                <span className={styles.checkIcon}>✓</span>
                3 active QR greeting cards
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                Unlimited scans & watch views
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                Secure cloud video hosting
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                High-resolution PNG/PDF exports
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                Standard wax seal designs
              </li>
            </ul>

            <button className={styles.ctaBtn} onClick={handleScrollToTop}>
              Create a card — It's Free
            </button>
          </article>

          {/* Card 2: Premium (Coming Soon) */}
          <article className={`${styles.card} ${styles.premiumCard}`}>
            <div className={styles.premiumBorderGlow}></div>
            <div className={styles.cardHeader}>
              <div className={`${styles.planBadge} ${styles.comingSoonBadge}`}>coming soon</div>
              <h3>Scandy Premium</h3>
              <p className={styles.planDesc}>Unlocks ultimate creativity and personalization.</p>
              <div className={styles.priceWrap}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>4.99</span>
                <span className={styles.period}>/month</span>
              </div>
            </div>

            <ul className={styles.features}>
              <li>
                <span className={`${styles.checkIcon} ${styles.premiumCheck}`}>✓</span>
                <strong>Unlimited</strong> QR greeting cards
              </li>
              <li>
                <span className={`${styles.checkIcon} ${styles.premiumCheck}`}>✓</span>
                No advertising on dashboards
              </li>
              <li>
                <span className={`${styles.checkIcon} ${styles.premiumCheck}`}>✓</span>
                Custom wax seal colors & monograms
              </li>
              <li>
                <span className={`${styles.checkIcon} ${styles.premiumCheck}`}>✓</span>
                Larger video uploads (up to 200MB)
              </li>
              <li>
                <span className={`${styles.checkIcon} ${styles.premiumCheck}`}>✓</span>
                Custom QR frame templates
              </li>
              <li>
                <span className={`${styles.checkIcon} ${styles.premiumCheck}`}>✓</span>
                Priority customer support
              </li>
            </ul>

            <button className={`${styles.ctaBtn} ${styles.disabledBtn}`} disabled>
              Beta Backer — Reserved
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
