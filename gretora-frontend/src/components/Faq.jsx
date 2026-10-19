import styles from './Faq.module.css';

const faqs = [
  {
    q: 'What exactly is Gretora?',
    a: 'Gretora is a free web platform that converts any video message into a scannable QR code. You upload a video, we generate a unique QR code, and you print it on any physical item — a card, frame, or gift tag. When someone scans it with their phone, your video plays instantly in their browser. No app needed on either side.',
  },
  {
    q: 'Is Gretora really free?',
    a: "Yes — completely. Your active video greeting is free with a full 3-day viewing window and unlimited scans. No credit card required, no trial period, no hidden charges. Each video can be up to 50MB in file size.",
  },
  {
    q: 'Does the person scanning need an app?',
    a: 'No. Any modern smartphone — iPhone or Android — can scan a QR code using the built-in camera app. No download, no account, no friction. They point the camera at the code, tap the notification, and your video plays. It works on over 95% of smartphones in use today.',
  },
  {
    q: 'How long does the QR code last?',
    a: "On the free tier, your video greeting is active for 3 days of unlimited scanning once created, followed by a grace period. Need to preserve your memories forever? Permanent retention and greeting regain options are coming soon with Gretora Premium.",
  },
  {
    q: 'Is my video private?',
    a: 'Yes. Every video has a unique, random URL that is impossible to guess. Only people who have your physical QR code can scan and watch it. Videos are private by default. You can also disable any QR code at any time from your dashboard, stopping all future access instantly.',
  },
  {
    q: 'What video formats are supported?',
    a: 'Gretora accepts all common video formats including MP4, MOV, AVI, and WebM. We recommend MP4 for best compatibility. Videos are automatically optimised for fast loading on mobile devices — your recipient will never wait for buffering.',
  },
];

export default function FAQ() {
  return (
    <section className={styles.faq} id="faq" aria-labelledby="faq-title">
      <div className={styles.faqInner}>
        <div className={styles.header}>
          <h2 id="faq-title">
            Everything you need<br /><em>to know</em>
          </h2>
          <p className={styles.sectionLead}>
            Common questions about Gretora — answered clearly.
          </p>
        </div>

        <div className={styles.faqGrid}>
          {faqs.map((item, i) => (
            <div className={styles.faqItem} key={i}>
              <div className={styles.question}>
                <h3>{item.q}</h3>
              </div>
              <p className={styles.answer}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

  );
}

