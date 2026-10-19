import styles from './Testimonials.module.css';

const moments = [
  {
    icon: '🎂',
    title: 'Family Celebrations',
    tag: 'Birthdays & Anniversaries',
    desc: 'Surprise parents and loved ones with a physical greeting card that plays heartfelt video wishes directly from family members near and far.',
  },
  {
    icon: '💍',
    title: 'Weddings & Invitations',
    tag: 'Weddings & Vows',
    desc: 'Embed your genuine love story or personal greetings into printed invitation cards for a surprise that guests will remember before they even arrive.',
  },
  {
    icon: '✈️',
    title: 'Long-Distance Love',
    tag: 'Across Continents',
    desc: 'Bridge thousands of miles with a tangible printed QR gift. One camera scan, and your voice, smile, and presence are right in front of them.',
  },
  {
    icon: '🎓',
    title: 'Milestones & Memories',
    tag: 'Graduations & Retirements',
    desc: 'Collect video tributes from friends, classmates, or colleagues into a single scannable keepsake that marks life\'s greatest milestones.',
  },
];

export default function Testimonials() {
  return (
    <section className={styles.testimonials} id="testimonials" aria-labelledby="testimonials-title">
      <div>
        <div className={styles.header}>
          <h2 id="testimonials-title">
            Gifts designed for <em>moments that matter</em>
          </h2>
          <p className={styles.sectionLead}>
            A printed card shows you remembered. A video message shows you were right there in person.
          </p>
        </div>

        <div className={styles.grid}>
          {moments.map((m, i) => (
            <div className={styles.item} key={i}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{m.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>{m.title}</h3>
              <p className={styles.quote} style={{ fontStyle: 'normal', marginBottom: '20px', fontSize: '14.5px', color: 'var(--text-muted)' }}>{m.desc}</p>
              <div className={styles.footer}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'var(--brand-light)',
                  background: 'var(--brand-soft)',
                  border: '1px solid var(--brand-border)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {m.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

