import { Link } from "react-router-dom";
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.navLogo}>
        Scan<em>dy</em>
      </Link>

      <ul>
        <li><a href="#how-it-works">How it works</a></li>
        <li><a href="#occasions">Occasions</a></li>
        <li><a href="#testimonials">Stories</a></li>
        <li><a href="#faq">FAQ</a></li>
      </ul>

      <Link to="/login">
        <button className={styles.navCta}>
          Sign up
        </button>
      </Link>
    </nav>
  );
}