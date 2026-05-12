// ViewGreetingPage.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./ViewGreetingPage.module.css";

export default function ViewGreetingPage() {
  const { id } = useParams();

  const [greeting, setGreeting] = useState(null);

  useEffect(() => {
    async function fetchGreeting() {
      try {
        const res = await fetch(
          `https://localhost:7246/g/${id}`
        );

        const data = await res.json();

        setGreeting(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchGreeting();
  }, [id]);

  if (!greeting) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Ambient Lights */}
      <div className={styles.glowOne}></div>
      <div className={styles.glowTwo}></div>
      <div className={styles.glowThree}></div>

      <div className={styles.container}>
        {/* Small Branding */}
        <div className={styles.brandBar}>
          <div className={styles.logo}>
            S
          </div>

          <div>
            <h4>Scandy</h4>
            <p>Premium Video Greetings</p>
          </div>
        </div>

        {/* Main Video Hero */}
        <div className={styles.heroCard}>
          {/* Animated Lid */}
          <div className={styles.giftLid}></div>

          {/* Sparkles */}
          <div className={styles.sparkle1}></div>
          <div className={styles.sparkle2}></div>
          <div className={styles.sparkle3}></div>

          {/* Floating Particles */}
          <div className={styles.particle1}></div>
          <div className={styles.particle2}></div>
          <div className={styles.particle3}></div>

          {/* Header */}
          <div className={styles.cardHeader}>
            <div className={styles.badge}>
              ✨ Personalized Surprise
            </div>

            <div className={styles.live}>
              ● Playing
            </div>
          </div>

          {/* Main Content */}
          <div className={styles.content}>
            <h1 className={styles.title}>
              {greeting.title}
            </h1>

            <p className={styles.message}>
              {greeting.message}
            </p>

            {/* Video Priority */}
            <div className={styles.videoFrame}>
              <div
                className={styles.videoGlow}
              ></div>

              <video
                controls
                autoPlay
                className={styles.video}
              >
                <source
                  src={greeting.videoUrl}
                  type="video/mp4"
                />
              </video>
            </div>
          </div>
        </div>

        {/* Marketing AFTER Video */}
        <div className={styles.bottomSection}>
          <div className={styles.marketingCard}>
            <div className={styles.marketingBadge}>
              Made with Scandy
            </div>

            <h3>
              Turn memories into unforgettable
              gift experiences.
            </h3>

            <p>
              Create personalized QR video
              greetings for birthdays,
              anniversaries, surprises, and
              special moments.
            </p>

            <a
              href="/"
              className={styles.ctaButton}
            >
              Create Your Own Surprise
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}