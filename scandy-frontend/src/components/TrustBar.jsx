import styles from './TrustBar.module.css';

const tags = [
  '🎂 Birthdays',
  '💍 Weddings',
  '👶 Baby showers',
  '🎓 Graduations',
  '✈️ Long distance',
  '🕊️ Memorials',
  '❤️ Valentine\'s Day',
  '🏠 Housewarmings',
];

export default function TrustBar() {
  return (
    <div className={styles.trustBar} role="complementary" aria-label="Supported occasions">
      <div className={styles.trustText}>Perfect for</div>
      <div className={styles.logoGrid} role="list">
        {tags.map((tag) => (
          <span key={tag} role="listitem">
            {tag}
          </span>
        ))}
      </div>
    </div>

  );
}