import styles from './CTASection.module.css';
import { useEffect, useRef } from 'react';

export default function CTASection() {
  const revealRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.visible);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  return (
    <section className={styles.ctaSection} id="get-started" aria-labelledby="cta-title">
      <div className={styles.ctaTag}>Free forever to start</div>
      <h2
        className={`${styles.ctaTitle} ${styles.reveal}`}
        id="cta-title"
        ref={addRef}
      >
        Leave something<br />
        they'll <em>never forget.</em>
      </h2>
      <p
        className={`${styles.ctaSub} ${styles.reveal}`}
        ref={addRef}
      >
        Your first three videos are completely free. No credit card. No setup.
        Upload once — remembered forever.
      </p>
      <button
        className={`${styles.btnCta} ${styles.reveal}`}
        ref={addRef}
        aria-label="Create your first free Scandy"
      >
        Create your first Scandy
      </button>
      <p className={styles.ctaNote}>3 free video QR codes · No credit card · Works on all phones</p>
    </section>
  );
}