import React from "react";
import styles from "./LoadingScreen.module.css";

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className={styles.loadingPage}>
      {/* Background Animated Glow Blobs */}
      <div className={styles.glowBlobOne}></div>
      <div className={styles.glowBlobTwo}></div>
      <div className={styles.glowBlobThree}></div>

      {/* Main Container */}
      <div className={styles.container}>
        {/* Animated premium loader ring */}
        <div className={styles.loaderRing}>
          <div className={styles.brandSymbol}>G</div>
          <div className={styles.spinner}></div>
        </div>

        {/* Text Details */}
        <div className={styles.textBlock}>
          <div className={styles.brandTitle}>
            <span className="brandName">Gretora</span>
          </div>
          <p className={styles.message}>{message}</p>
        </div>
      </div>
    </div>
  );
}


