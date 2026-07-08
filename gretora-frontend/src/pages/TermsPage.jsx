import React from 'react';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import styles from './PrivacyPage.module.css'; // Share the same styling since they look identical

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.contentCard}>
        <h2>Terms of Service</h2>
        <div className={styles.goldDivider}></div>
        <div className={styles.scrollContent}>
          <p><em>Last Updated: July 2026</em></p>
          <p>By using Gretora, you agree to comply with and be bound by the following terms of service.</p>
          
          <h4>1. Eligibility & Registration</h4>
          <p>You must create an account to generate greeting cards. You agree to provide accurate registration details and maintain the security of your authentication sessions.</p>

          <h4>2. Permissible Video Uploads</h4>
          <p>You retain full copyright of your uploaded video messages. However, you are solely responsible for ensuring your content complies with safety guidelines. You strictly agree not to upload content that:</p>
          <ul>
            <li>Is illegal, threatening, defamatory, or extremely offensive.</li>
            <li>Violates third-party intellectual property or copyright laws.</li>
            <li>Contains explicit adult material or incites violence.</li>
          </ul>

          <h4>3. Content Review & Safety Banning</h4>
          <p>Gretora operates on a strict content-safety policy. If a recipient reports a greeting for violating guidelines, our administration team reserves the right to review the flagged video, block the content, and permanently suspend/ban the creator account without warning.</p>

          <h4>4. Disclaimer of Liability</h4>
          <p>Gretora does not endorse or take responsibility for user-generated videos. By using our site, you agree that Gretora is not liable for any content shared, and you use the service at your own discretion.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}