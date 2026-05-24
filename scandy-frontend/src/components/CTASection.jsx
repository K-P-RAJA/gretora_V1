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
    <section className={styles.cta} id="get-started" aria-labelledby="cta-title">
      <div className={styles.box}>
        <h2 id="cta-title">
          Leave something<br />
          they'll <em>never forget.</em>
        </h2>
        <p>
          Your first three videos are completely free. No credit card. No setup.
          Upload once — remembered forever.
        </p>
        <button
          className={styles.btn}
          aria-label="Create your first free Scandy"
        >
          Create your first Scandy
        </button>
      </div>
    </section>

  );
}