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
      <span className={styles.trustLabel}>Perfect for</span>
      <div className={styles.trustDivider} />
      <div className={styles.trustTags} role="list">
        {tags.map((tag) => (
          <span key={tag} className={styles.trustTag} role="listitem">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}