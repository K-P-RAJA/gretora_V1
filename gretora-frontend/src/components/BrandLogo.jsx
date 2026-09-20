import React from "react";
import styles from "./BrandLogo.module.css";
import logoIcon from "../assets/logo-icon.png";

export default function BrandLogo({ 
  size = "md", 
  showTagline = true, 
  customTagline = "Your words. Their smile. One scan.",
  style = {},
  className = ""
}) {
  return (
    <div className={`${styles.logoWrap} ${styles[size]} ${className}`} style={style}>
      <img src={logoIcon} alt="Gretora" className={styles.logoIcon} />
      <div className={styles.textContainer}>
        <span className={styles.brandName}>Gretora</span>
        {showTagline && (
          <span className={styles.tagline}>{customTagline}</span>
        )}
      </div>
    </div>
  );
}
