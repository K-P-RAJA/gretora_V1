import React, { useState } from 'react';
import styles from './GreetingCards.module.css';
import { QRCode } from 'react-qrcode-logo';

export default function GreetingCards() {
  const [opened, setOpened] = useState(false);

  const mockQrUrl = "https://Gretora.com/g/demo-greeting";

  const handleCardClick = (e) => {
    // If the card is closed, click opens the card.
    if (!opened) {
      setOpened(true);
    }
  };

  return (
    <section className={styles.section} id="greeting">
      <div className={styles.inner}>

        {/* LEFT: Copy content */}
        <div className={styles.left}>
          <div className={styles.eyebrow}>Real Experience Preview</div>
          <h2 className={styles.title}>
            A digital card that<br />
            <em>feels truly real.</em>
          </h2>
          <p className={styles.sub}>
            We've combined the emotion of a physical greeting card with the magic of video. 
            No more boring links. Give them an experience they can open, watch, and keep forever.
            Click on the card to open it and interact!
          </p>

          <div className={styles.pills}>
            <span className={styles.pill}>✨ Warm Paper Textures</span>
            <span className={styles.pill}>🎥 Surprising Video Scan</span>
            <span className={styles.pill}>💖 Premium Gold Wax Seals</span>
          </div>
        </div>

        {/* RIGHT: 3D Realistic Folding Card Demo */}
        <div className={styles.right}>
          <div 
            className={`${styles.cardContainer} ${opened ? styles.opened : ''}`} 
            onClick={handleCardClick}
          >
            {/* INSIDE RIGHT PAGE (Permanently fixed in background) */}
            <div className={styles.cardBack}>
              <div className={styles.displayFrame}>
                <div className={styles.qrInteraction}>
                  <div className={styles.frameHeader}>Scan to Reveal</div>
                  
                  <div className={styles.qrGlass}>
                    <div className={styles.qrWrapper}>
                      <QRCode
                        value={mockQrUrl}
                        size={130}
                        bgColor="transparent"
                        fgColor="#2a1610"
                        qrStyle="dots"
                        eyeRadius={[8, 8, 8, 8]}
                        eyeColor="#b48c50"
                      />
                    </div>
                  </div>
                  
                  <div className={styles.playHint}>
                    Recipient scans to play video
                  </div>
                </div>
              </div>
            </div>

            {/* FRONT FOLDING FLAP (folds open around left axis) */}
            <div className={styles.cardFront}>
              {/* INSIDE LEFT PAGE (Back of the front cover - visible when card is open) */}
              <div className={styles.cardFrontInside}>
                {/* Decorative Corner Ornaments */}
                <div className={`${styles.ornament} ${styles.topLeft}`}></div>
                <div className={`${styles.ornament} ${styles.topRight}`}></div>
                <div className={`${styles.ornament} ${styles.bottomLeft}`}></div>
                <div className={`${styles.ornament} ${styles.bottomRight}`}></div>

                <div className={styles.brandHeader}>
                  <span className={styles.brandLogo}>Gretora</span>
                  <span className={styles.tag}>Premium Greetings</span>
                </div>

                <div className={styles.recipientBlock}>
                  <h2 className={styles.occasionText}>Happy Birthday!</h2>
                  <p className={styles.smallLabel}>FOR</p>
                  <h1 className={styles.recipientName}>Someone Special</h1>
                  <div className={styles.goldDivider}></div>
                </div>

                <div className={styles.messageBlock}>
                  <p className={styles.messageText}>
                    Wishing you the most magical year ahead. You deserve all the happiness in the world. Enjoy your special day! 🎉
                  </p>
                </div>

                <div className={styles.waxSeal}>
                  <span>S</span>
                </div>
                
                <span className={styles.signature}>With love, Alex</span>


              </div>

              {/* OUTSIDE COVER PAGE (Visible when closed) */}
              <div className={styles.cardFrontOutside}>
                <div className={styles.coverText}>
                  <h2>For<br/>Someone<br/>Special</h2>
                </div>
                {!opened && <div className={styles.tapPrompt}>Tap to open</div>}
              </div>
            </div>
            
          </div>
          {opened && (
            <button 
              className={styles.closeCardBtn} 
              onClick={(e) => {
                e.stopPropagation();
                setOpened(false);
              }}
            >
              ✕ Close Card
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

