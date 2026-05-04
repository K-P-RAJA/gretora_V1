import styles from './Testimonials.module.css';

const testimonials = [
  {
    stars: '★★★★★',
    text: '"I sent my mum a birthday card with a QR code on it. She scanned it and watched a 90-second video of our whole family singing to her. She cried for 20 minutes. Worth every second."',
    author: '— Divya R., Bangalore',
  },
  {
    stars: '★★★★★',
    text: '"Used Scandy for my dad\'s retirement gift. Collected videos from 14 colleagues and linked them all. He still scans it every few weeks. Says it\'s the best gift he\'s ever received."',
    author: '— Karthik S., Hyderabad',
  },
  {
    stars: '★★★★★',
    text: '"We embedded a QR on our wedding invites — it played a 60 second video of us telling our story. Guests were in tears before they even arrived."',
    author: '— Arjun & Priya, Chennai',
  },
  {
    stars: '★★★★★',
    text: '"My son is studying in Canada. I sent him a Diwali card with a Scandy QR. He called me immediately after scanning. He was sobbing. So was I."',
    author: '— Sunita M., Mumbai',
  },
];

export default function Testimonials() {
  return (
    <section className={styles.testimonialsSection} id="testimonials" aria-labelledby="testimonials-title">
      <div className={styles.sectionInner}>
        <div className="reveal">
          <div className={styles.eyebrow}>Real stories</div>
          <h2 id="testimonials-title">
            Moments that <em>moved people</em>
          </h2>
          <p className={styles.sectionLead}>
            These aren't marketing lines. They're what people actually said after sending their first Scandy.
          </p>
        </div>

        <div className={`${styles.testimonialsGrid} reveal reveal-delay-1`}>
          {testimonials.map((t, i) => (
            <blockquote className={styles.testimonial} key={i}>
              <div className={styles.testimonialStars} aria-label="5 stars">{t.stars}</div>
              <p className={styles.testimonialText}>{t.text}</p>
              <cite className={styles.testimonialAuthor}>{t.author}</cite>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}