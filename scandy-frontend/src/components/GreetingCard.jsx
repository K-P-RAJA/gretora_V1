import styles from './GreetingCards.module.css';
import { useState } from 'react';

const CARDS = [
  {
    occasion: '🎂 Birthday',
    to: 'For Priya',
    headline: 'A surprise just for you',
    sub: 'From someone who loves you lots',
    color: '#D94F3D',
    bg: '#FFF5F4',
    accent: '#FDDDD9',
    preview: 'https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg?auto=compress&cs=tinysrgb&w=600',
    message: "Happy Birthday Priya! 🎂 Wishing you the most magical year filled with everything you love. You deserve every bit of joy coming your way!",
  },
  {
    occasion: '💍 Wedding',
    to: 'For Meera & Arjun',
    headline: 'Your love story begins',
    sub: 'A message from the heart',
    color: '#C9A84C',
    bg: '#FFFBF0',
    accent: '#FDF3CC',
    preview: 'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=600',
    message: "Wishing you both a lifetime of laughter, adventure, and unconditional love. May every day feel like your wedding day! 💍",
  },
  {
    occasion: '🎓 Graduation',
    to: 'For Rahul',
    headline: 'So incredibly proud of you',
    sub: 'This is just the beginning',
    color: '#2D6A4F',
    bg: '#F0FFF6',
    accent: '#C8F0DC',
    preview: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=600',
    message: "Rahul, watching you walk across that stage was the proudest moment of my life. You worked so hard for this. Now go change the world! 🎓",
  },
];

export default function GreetingCards() {
  const [active, setActive] = useState(0);
  const [opened, setOpened] = useState(false);
  const [showMsg, setShowMsg] = useState(false);

  const card = CARDS[active];

  function switchCard(i) {
    setActive(i);
    setOpened(false);
    setShowMsg(false);
  }

  function handleOpen() {
    setOpened(true);
    setTimeout(() => setShowMsg(true), 600);
  }

  return (
    <section className={styles.section} id="greeting">
      <div className={styles.inner}>

        {/* LEFT: copy */}
        <div className={styles.left}>
          <div className={styles.eyebrow}>Instant greeting cards</div>
          <h2 className={styles.title}>
            Send a greeting they<br />
            <em>open, not just read</em>
          </h2>
          <p className={styles.sub}>
            Share a beautiful card link on WhatsApp, iMessage, or email.
            When they open it — your video, your voice, your moment.
          </p>

          {/* Occasion switcher */}
          <div className={styles.switcher}>
            {CARDS.map((c, i) => (
              <button
                key={i}
                className={`${styles.switchBtn} ${active === i ? styles.switchActive : ''}`}
                style={active === i ? { borderColor: c.color, color: c.color, background: c.bg } : {}}
                onClick={() => switchCard(i)}
              >
                {c.occasion}
              </button>
            ))}
          </div>

          {/* Proof pills */}
          <div className={styles.pills}>
            <span className={styles.pill}>✨ WhatsApp ready</span>
            <span className={styles.pill}>📱 Opens in 1 tap</span>
            <span className={styles.pill}>🖨️ Also prints as QR</span>
          </div>
        </div>

        {/* RIGHT: live card demo */}
        <div className={styles.right}>
          <div className={styles.phoneMock}>
            <div className={styles.phoneBar}>
              <span className={styles.phoneCamera} />
            </div>

            <div
              className={`${styles.card} ${opened ? styles.cardOpened : ''}`}
              style={{ background: card.bg, '--card-color': card.color, '--card-accent': card.accent }}
            >
              {/* Closed state */}
              <div className={`${styles.cardFront} ${opened ? styles.hidden : ''}`}>
                <div className={styles.cardImgWrap}>
                  <img src={card.preview} alt={card.occasion} className={styles.cardImg} />
                  <div className={styles.cardImgOverlay} style={{ background: `linear-gradient(to top, ${card.bg} 10%, transparent 60%)` }} />
                </div>
                <div className={styles.cardFrontBody}>
                  <span className={styles.cardOccasion} style={{ color: card.color }}>{card.occasion}</span>
                  <div className={styles.cardTo}>For {card.to.replace('For ', '')}</div>
                  <h3 className={styles.cardHeadline}>{card.headline}</h3>
                  <p className={styles.cardSub}>{card.sub}</p>
                  <button
                    className={styles.openBtn}
                    style={{ background: card.color }}
                    onClick={handleOpen}
                  >
                    Open your card →
                  </button>
                </div>
              </div>

              {/* Opened state */}
              <div className={`${styles.cardBack} ${opened ? styles.cardBackVisible : ''}`}>
                <div className={styles.videoBox} style={{ borderColor: card.accent }}>
                  <div className={styles.videoPlaceholder} style={{ background: card.accent }}>
                    <div className={styles.playBtn} style={{ borderColor: card.color }}>
                      <div className={styles.playTriangle} style={{ borderLeftColor: card.color }} />
                    </div>
                    <span className={styles.videoLabel} style={{ color: card.color }}>
                      Video message
                    </span>
                  </div>
                </div>
                {showMsg && (
                  <p className={styles.msgText}>
                    {card.message}
                  </p>
                )}
                <button
                  className={styles.resetBtn}
                  onClick={() => { setOpened(false); setShowMsg(false); }}
                >
                  ← Close card
                </button>
              </div>
            </div>

            {/* Notification badge */}
            {!opened && (
              <div className={styles.notifBadge} style={{ background: card.color }}>
                Tap to open
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}