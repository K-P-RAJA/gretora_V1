import { Link } from "react-router-dom";
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.navLogo}>Scan<em>dy</em></Link>

        <ul className={styles.navLinks}>
          <li><a href="#how-it-works">How it works</a></li>
          <li><a href="#occasions">Occasions</a></li>
          <li><a href="#testimonials">Stories</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>

        <Link to="/login" className={styles.navCta}>
          Get Started
        </Link>
      </div>
    </nav>
  );
}