import React, { useState, useEffect } from "react";
import styles from "./LoadingScreen.module.css";
import logoIcon from "../assets/logo-icon.png";

const QUOTES = [
  {
    text: "The greatest gift you can give someone is your time and loving attention.",
    author: "— Maya Angelou",
  },
  {
    text: "Kind words can be short and easy to speak, but their echoes are truly endless.",
    author: "— Mother Teresa",
  },
  {
    text: "There is no exercise better for the heart than reaching down and lifting people up.",
    author: "— John Holmes",
  },
  {
    text: "Every celebration deserves to be remembered. That's why we're here.",
    author: "— Gretora",
  },
  {
    text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.",
    author: "— Mother Teresa",
  },
  {
    text: "The best and most beautiful things in the world cannot be seen or touched — they must be felt with the heart.",
    author: "— Helen Keller",
  },
  {
    text: "A warm greeting is a universal language of kindness.",
    author: "— Ralph Waldo Emerson",
  },
  {
    text: "Cherish your human connections: your relationships with friends and family.",
    author: "— Barbara Bush",
  },
];

const TIPS = [
  "💡 Did you know? Anyone can open your greeting with a single QR scan — no app needed.",
  "🎉 Tip: You can create greetings for birthdays, weddings, anniversaries, and more.",
  "📱 Tip: Your QR greeting works on any phone, anywhere in the world.",
  "🌟 Did you know? You can track how many times your greeting has been opened.",
  "✨ Tip: Personalise your greeting with the recipient's name for an extra special touch.",
];

export default function LoadingScreen({ message = "Verifying session..." }) {
  const [isEngaged, setIsEngaged] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [tipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [quoteVisible, setQuoteVisible] = useState(true);

  // Switch to engaged mode after 3 seconds
  useEffect(() => {
    const engageTimer = setTimeout(() => setIsEngaged(true), 3000);
    return () => clearTimeout(engageTimer);
  }, []);

  // Cycle quotes every 5 seconds with fade
  useEffect(() => {
    if (!isEngaged) return;
    const interval = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        setQuoteVisible(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [isEngaged]);

  const currentQuote = QUOTES[quoteIndex];

  return (
    <div className={styles.loadingPage}>
      {/* Background Animated Glow Blobs */}
      <div className={styles.glowBlobOne}></div>
      <div className={styles.glowBlobTwo}></div>

      {/* Main Glassmorphic Card */}
      <div className={`${styles.container} ${isEngaged ? styles.containerEngaged : ""}`}>
        {/* Animated Brand Emblem */}
        <div className={styles.emblemWrap}>
          <div className={styles.spinnerRing}></div>
          <img src={logoIcon} alt="Gretora" className={styles.brandIcon} />
        </div>

        {/* Brand Name & Tagline */}
        <div className={styles.brandInfo}>
          <h1 className={styles.brandTitle}>Gretora</h1>
          <p className={styles.brandSubtitle}>Your words. Their smile. One scan.</p>
        </div>

        {/* Engaged: Quote + Tip panel */}
        {isEngaged && (
          <div className={styles.engagePanel}>
            {/* Divider */}
            <div className={styles.divider}></div>

            {/* Rotating Quote */}
            <div
              className={`${styles.quoteBlock} ${quoteVisible ? styles.quoteVisible : styles.quoteHidden}`}
            >
              <span className={styles.quoteIcon}>"</span>
              <p className={styles.quoteText}>{currentQuote.text}</p>
              <p className={styles.quoteAuthor}>{currentQuote.author}</p>
            </div>

            {/* Gretora Tip */}
            <div className={styles.tipBlock}>
              <p className={styles.tipText}>{TIPS[tipIndex]}</p>
            </div>
          </div>
        )}

        {/* Progress & Message */}
        <div className={styles.statusBox}>
          <div className={styles.loadingBar}>
            <div className={styles.loadingProgress}></div>
          </div>
          <p className={styles.messageText}>
            {isEngaged ? "Still warming up, almost there…" : message}
          </p>
        </div>
      </div>
    </div>
  );
}
