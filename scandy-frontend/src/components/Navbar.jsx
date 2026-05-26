import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../api/authService";
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    async function checkUserAuth() {
      const result = await isAuthenticated();
      setIsAuth(result);
    }
    checkUserAuth();
  }, []);

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.navLogo}>Scan<em>dy</em></Link>

        <ul className={styles.navLinks}>
          <li><a href="/#how-it-works">How it works</a></li>
          <li><a href="/#occasions">Occasions</a></li>
          <li><a href="/#testimonials">Stories</a></li>
          <li><a href="/#faq">FAQ</a></li>
          <li><a href="/#pricing">Pricing</a></li>
        </ul>

        {isAuth ? (
          <Link to="/home" className={styles.navCta}>
            Dashboard
          </Link>
        ) : (
          <Link to="/login" className={styles.navCta}>
            Get Started
          </Link>
        )}
      </div>
    </nav>
  );
}