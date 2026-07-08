import styles from './Testimonials.module.css';

const testimonials = [
  {
    stars: '★★★★★',
    text: '"I sent my mum a birthday card with a QR code on it. She scanned it and watched a 90-second video of our whole family singing to her. She cried for 20 minutes. Worth every second."',
    author: '— Divya R., Bangalore',
  },
  {
    stars: '★★★★★',
    text: '"Used Gretora for my dad\'s retirement gift. Collected videos from 14 colleagues and linked them all. He still scans it every few weeks. Says it\'s the best gift he\'s ever received."',
    author: '— Karthik S., Hyderabad',
  },
  {
    stars: '★★★★★',
    text: '"We embedded a QR on our wedding invites — it played a 60 second video of us telling our story. Guests were in tears before they even arrived."',
    author: '— Arjun & Ashwini, Chennai',
  },
  {
    stars: '★★★★★',
    text: '"My son is studying in Canada. I sent him a Diwali card with a Gretora QR. He called me immediately after scanning. He was sobbing. So was I."',
    author: '— Sunita M., Mumbai',
  },
];

export default function Testimonials() {
  return (
    <section className={styles.testimonials} id="testimonials" aria-labelledby="testimonials-title">
      <div>
        <div className={styles.header}>
          <h2 id="testimonials-title">
            Moments that <em>moved people</em>
          </h2>
          <p className={styles.sectionLead}>
            These aren't marketing lines. They're what people actually said after sending their first Gretora.
          </p>
        </div>

        <div className={styles.grid}>
          {testimonials.map((t, i) => (
            <div className={styles.item} key={i}>
              <p className={styles.quote}>{t.text}</p>
              <div className={styles.footer}>
                <div className={styles.avatar}>
                  {t.author.split('—')[1]?.trim()[0] || 'S'}
                </div>
                <div className={styles.info}>
                  <h4>{t.author.split(',')[0]}</h4>
                  <p>{t.author.split(',')[1]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

  );
}

