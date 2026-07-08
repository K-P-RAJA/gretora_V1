import React from 'react';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import styles from './PrivacyPage.module.css';

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.contentCard}>
        <h2>Privacy Policy</h2>
        <div className={styles.goldDivider}></div>
        <div className={styles.scrollContent}>
          <p><em>Last Updated: July 2026</em></p>
          <p>Welcome to Gretora. We value your privacy and are committed to protecting your personal data and uploaded video files.</p>
          
          <h4>1. Information We Collect</h4>
          <p>We collect minimal information to provide our services:</p>
          <ul>
            <li><strong>Account Details:</strong> Your name and email address when you register.</li>
            <li><strong>Video Content:</strong> Video files that you upload are stored securely on our video hosting servers.</li>
            <li><strong>Scans Telemetry:</strong> Anonymized country code geolocation logs when someone scans your QR code. We never collect recipient personal information.</li>
          </ul>

          <h4>2. How We Protect Your Videos</h4>
          <p>Every greeting has a uniquely generated UUID that acts as a secure key. Your videos are not publicly indexed by search engines. They can only be accessed by scanning the physical QR code or visiting the randomized private link.</p>

          <h4>3. Data Retention</h4>
          <p>You have full control over your data. You can delete any greeting card from your dashboard at any time. Deleting a card instantly deletes it and permanently removes the video file from our hosting servers.</p>

          <h4>4. Cookies & Ad Networks</h4>
          <p>We use essential cookies to maintain secure authentication sessions. Non-intrusive ad networks may serve ads on user dashboards to fund free hosting. Ads are never displayed on public recipient watch pages.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}