import styles from './GreetingCards.module.css';
import { useState } from 'react';

export default function GreetingCards() {
  const [opened, setOpened] = useState(false);

  return (
    <section className={styles.section} id="greeting">
      <div className={styles.inner}>

        {/* LEFT: copy */}
        <div className={styles.left}>
          <div className={styles.eyebrow}>Premium Experience</div>
          <h2 className={styles.title}>
            A digital card that<br />
            <em>feels truly real.</em>
          </h2>
          <p className={styles.sub}>
            We've combined the emotion of a physical greeting card with the magic of video. 
            No more boring links. Give them an experience they can open, watch, and keep forever.
          </p>

          <div className={styles.pills}>
            <span className={styles.pill}>✨ Beautiful designs</span>
            <span className={styles.pill}>🎥 Embedded video</span>
            <span className={styles.pill}>💖 Meaningful messages</span>
          </div>
        </div>

        {/* RIGHT: 3D Card Demo */}
        <div className={styles.right}>
          <div 
            className={`${styles.cardContainer} ${opened ? styles.opened : ''}`} 
            onClick={() => setOpened(!opened)}
          >
            {/* BACK of the card (the inside right page) */}
            <div className={styles.cardBack}>
              <div className={styles.videoPlaceholder}>
                <div className={styles.playBtn}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <polygon points="7,5 19,12 7,19" fill="currentColor" />
                  </svg>
                </div>
              </div>
              <div className={styles.cardMessage}>
                <h3>Happy Birthday!</h3>
                <p>Wishing you the most magical year ahead. You deserve all the happiness in the world. Enjoy your special day! 🎉</p>
                <span className={styles.signature}>With love, Alex</span>
              </div>
            </div>

            {/* FRONT of the card (folds open) */}
            <div className={styles.cardFront}>
              {/* Inside of the front flap (left page when open) */}
              <div className={styles.cardFrontInside}>
                <div className={styles.insideQr}>
                  <div className={styles.qrCode}>
                    <div className={styles.qrInner}></div>
                  </div>
                  <p>Scan to keep</p>
                </div>
              </div>

              {/* Outside of the front flap (the cover) */}
              <div className={styles.cardFrontOutside}>
                <div className={styles.coverText}>
                  <h2>For<br/>Someone<br/>Special</h2>
                </div>
                {!opened && <div className={styles.tapPrompt}>Tap to open</div>}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}