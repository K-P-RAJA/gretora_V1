import styles from './WhyScandy.module.css';

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Private & secure',
    desc: 'Every video gets a unique, unguessable URL. Your content is private by default — only people with the QR code can watch it. You control it completely.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12,6 12,12 16,14"/>
      </svg>
    ),
    title: 'Works forever',
    desc: "Your QR code never expires. Print it once, scan it for years. A wedding invitation from 2026 will still play the video in 2046. Memories shouldn't have an expiry date.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
    title: 'No app needed',
    desc: 'Anyone with a smartphone can scan and watch — iPhone or Android. No download, no account, no friction. Just point the camera and watch the love play out.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
        <polyline points="17,6 23,6 23,12"/>
      </svg>
    ),
    title: 'Fast video delivery',
    desc: "Your video is served from edge servers closest to your recipient. Whether they're in Chennai or Chicago, it plays instantly — no buffering, no waiting.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
    title: 'Completely free to start',
    desc: 'Your first three video QR codes are completely free — no credit card, no trial period, no catch. Create your first Scandy in under 2 minutes.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    title: 'Print on anything',
    desc: "Cards, gift tags, photo frames, wedding invitations, memory books, keychains — your QR code is just an image. If you can print on it, you can Scandy it.",
  },
];

export default function WhyScandy() {
  return (
    <section className={styles.why} aria-labelledby="why-title">
      <div className={styles.inner}>
        <div>
          <div className={styles.eyebrow}>
            Why Scandy
          </div>
          <h2 id="why-title" className={styles.title}>
            The most personal gift<br />
            <em>you can give</em>
          </h2>
          <p className={styles.desc}>
            A card says you remembered. A Scandy says you showed up in person — without being there.
          </p>
        </div>

        <div className={styles.featureGrid}>
          {features.map((f, i) => (
            <div className={styles.feature} key={i}>
              <div className={styles.fIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

  );
}