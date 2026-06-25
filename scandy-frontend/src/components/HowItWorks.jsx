import { useEffect, useRef } from 'react';
import styles from './HowItWorks.module.css';

const steps = [
  {
    number: '01',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
      </svg>
    ),
    title: 'Upload your video',
    desc: 'Record or upload any video message up to 50MB. A birthday message, a wedding vow, a heartfelt "I love you from 3,000 miles away" — anything worth saying once and remembering forever.',
  },
  {
    number: '02',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
        <rect x="18" y="18" width="3" height="3"/>
      </svg>
    ),
    title: 'Receive your QR code',
    desc: 'Gretora instantly generates a unique, secure QR code linked only to your video. Download it in high resolution — ready to print on cards, invitations, photo frames, stickers, or any surface you can imagine.',
  },
  {
    number: '03',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    ),
    title: 'Watch their face light up',
    desc: 'They scan the code with any smartphone camera — no app, no account needed. Your video plays instantly in their browser. That moment of surprise, recognition, and pure joy? That\'s Gretora.',
  },
];

export default function HowItWorks() {
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

  return (
    <section className={styles.howItWorks} id="how-it-works" aria-labelledby="how-title">
      <div className={styles.header}>
        <div className={styles.eyebrow}>Simple process</div>
        <h2 id="how-title">
          Three steps to a gift<br /><em>they'll never forget</em>
        </h2>
        <p className={styles.sectionLead}>
          No technical skills needed. No app to download. Just a video, a QR code, and a memory that lasts forever.
        </p>
      </div>

      <div className={styles.grid}>
        {steps.map((step) => (
          <article key={step.number} className={styles.step}>
            <div className={styles.num}>{step.number}</div>
            <div className={styles.icon}>{step.icon}</div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </article>
        ))}
      </div>
    </section>

  );
}

