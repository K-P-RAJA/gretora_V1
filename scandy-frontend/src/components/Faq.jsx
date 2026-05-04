import styles from './FAQ.module.css';

const faqs = [
  {
    q: 'What exactly is Scandy?',
    a: 'Scandy is a free web platform that converts any video message into a scannable QR code. You upload a video, we generate a unique QR code, and you print it on any physical item — a card, frame, or gift tag. When someone scans it with their phone, your video plays instantly in their browser. No app needed on either side.',
  },
  {
    q: 'Is Scandy really free?',
    a: "Yes — completely. Your first 3 video QR codes are free forever. No credit card required, no trial period, no hidden charges. Each video can be up to 2 minutes long. We generate revenue through non-intrusive ads on the upload and dashboard pages — never on the watch page, so your recipient's experience is always uninterrupted.",
  },
  {
    q: 'Does the person scanning need an app?',
    a: 'No. Any modern smartphone — iPhone or Android — can scan a QR code using the built-in camera app. No download, no account, no friction. They point the camera at the code, tap the notification, and your video plays. It works on over 95% of smartphones in use today.',
  },
  {
    q: 'How long does the QR code last?',
    a: "Your Scandy QR code works as long as your account is active. We are committed to link permanence — if we ever shut down (which we plan never to do), we'll give 90 days notice so you can download all your videos. You can also download your original video at any time as a personal backup.",
  },
  {
    q: 'Is my video private?',
    a: 'Yes. Every video has a unique, random URL that is impossible to guess. Only people who have your physical QR code can scan and watch it. Videos are private by default. You can also disable any QR code at any time from your dashboard, stopping all future access instantly.',
  },
  {
    q: 'What video formats are supported?',
    a: 'Scandy accepts all common video formats including MP4, MOV, AVI, and WebM. We recommend MP4 for best compatibility. Videos are automatically optimised for fast loading on mobile devices — your recipient will never wait for buffering.',
  },
];

export default function FAQ() {
  return (
    <section className={styles.faqSection} id="faq" aria-labelledby="faq-title">
      <div className={styles.sectionInner}>
        <div className="reveal">
          <div className={styles.eyebrow}>FAQ</div>
          <h2 id="faq-title">
            Everything you need<br /><em>to know</em>
          </h2>
          <p className={styles.sectionLead}>
            Common questions about Scandy — answered clearly.
          </p>
        </div>

        <div className={`${styles.faqGrid} reveal reveal-delay-1`}>
          {faqs.map((item, i) => (
            <div className={styles.faqItem} key={i}>
              <h3 className={styles.faqQ}>{item.q}</h3>
              <p className={styles.faqA}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}