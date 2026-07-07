import styles from './Occasions.module.css';
import { useEffect, useRef } from 'react';

const occasions = [
  {
    emoji: '🎂',
    label: 'Birthdays',
    title: 'Birthday gifts',
    desc: 'A birthday card that actually sings in your voice. Stick the QR on any gift — they scan it, and there you are.',
    img: '/images/occasions/gretora-birthday.jpg',
    alt: 'Birthday celebration with candles',
    span: 'wide',
  },
  {
    emoji: '💍',
    label: 'Weddings',
    title: 'Weddings',
    desc: 'Embed your vows or love story inside the invitation itself. A gift before the gift.',
    img: '/images/occasions/gretora-wedding.jpg',
    alt: 'Wedding couple hands with rings',
    span: 'tall',
  },
  {
    emoji: '🎓',
    label: 'Graduations',
    title: 'Graduations',
    desc: 'Stick a QR on the back of their frame. 20 years later, they hear your proud voice.',
    img: '/images/occasions/gretora-graduation.jpg',
    alt: 'Graduation cap toss celebration',
    span: 'normal',
  },
  {
    emoji: '✈️',
    label: 'Long distance',
    title: 'Long distance love',
    desc: 'Send a card across continents. They scan it — suddenly you\'re right there.',
    img: '/images/occasions/gretora-longdistance.jpg',
    alt: 'Airplane view from window seat',
    span: 'normal',
  },
  {
    emoji: '👶',
    label: 'Baby showers',
    title: 'Baby showers & newborns',
    desc: 'A memory linked forever to a birth announcement card. Beyond any hard drive.',
    img: '/images/occasions/gretora-babyshower.jpg',
    alt: 'Newborn baby sleeping peacefully',
    span: 'normal',
  },
  {
    emoji: '🕊️',
    label: 'Memorials',
    title: 'Memorials & tributes',
    desc: 'A voice that lives on. A laugh you never want to forget. Scan. Hear them speak again.',
    img: '/images/occasions/gretora-celebration.jpg',
    alt: 'Candles lit in memorial',
    span: 'wide',
  },
];

export default function Occasions() {
  const revealRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.visible);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.07 }
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  return (
    <section className={styles.occasions} id="occasions" aria-labelledby="occasions-title">
      <div>
        <div className={styles.header}>
          <div className={styles.tag}>Every celebration</div>
          <h2 id="occasions-title" className={styles.h2}>
            Where <em>Gretora</em> belongs
          </h2>
          <p className={styles.cardDesc}>
            Video messages belong everywhere love is shared — not just on screens. Here are the moments Gretora was made for.
          </p>
        </div>

        <div className={styles.grid}>
          {occasions.map((o, i) => (
            <article key={i} className={styles.card}>
              <span className={styles.icon}>{o.emoji}</span>
              <div className={styles.cardContent}>
                <span className={styles.tag}>{o.label}</span>
                <h3 className={styles.cardTitle}>{o.title}</h3>
                <p className={styles.cardDesc}>{o.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

