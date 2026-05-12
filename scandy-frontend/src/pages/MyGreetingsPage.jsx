import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

import {
  getMyGreetings,
  deleteGreeting,
} from "../api/greetingService";

import AppNavbar from "../components/AppNavbar";

import styles from "./MyGreetingsPage.module.css";

export default function MyGreetingsPage() {
  const navigate = useNavigate();

  const [greetings, setGreetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGreetings();
  }, []);

  async function loadGreetings() {
    try {
      const data = await getMyGreetings();

      setGreetings(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load greetings");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Delete this greeting?"
    );

    if (!confirmed) return;

    try {
      await deleteGreeting(id);

      setGreetings((prev) =>
        prev.filter((g) => g.id !== id)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to delete greeting");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgGlowOne}></div>
      <div className={styles.bgGlowTwo}></div>

      {/* PREMIUM NAVBAR */}
      <AppNavbar />

      {/* HERO */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.subheading}>
            YOUR COLLECTION
          </p>

          <h1>
            Premium
            <span> Greetings</span>
          </h1>

          <p className={styles.heroText}>
            Manage and revisit your personalized
            QR video greeting experiences.
          </p>
        </div>

        <button
          className={styles.createBtn}
          onClick={() => navigate("/home")}
        >
          + Create Greeting
        </button>
      </header>

      {/* LOADING */}
      {loading ? (
        <div className={styles.loadingCard}>
          Loading greetings...
        </div>
      ) : greetings.length === 0 ? (
        <div className={styles.emptyCard}>
          <h2>No greetings yet</h2>

          <p>
            Create your first QR video greeting
            and start sharing memories.
          </p>

          <button
            className={styles.emptyBtn}
            onClick={() => navigate("/home")}
          >
            Create First Greeting
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {greetings.map((greeting) => (
            <div
              key={greeting.id}
              className={styles.card}
            >
              {/* TOP */}
              <div className={styles.cardTop}>
                <div>
                  <div className={styles.occasionTag}>
                    {greeting.occassion}
                  </div>

                  <h2>{greeting.title}</h2>

                  <p className={styles.recipient}>
                    For{" "}
                    {
                      greeting.receiptantName
                    }
                  </p>
                </div>
              </div>

              {/* PREVIEW */}
              <div className={styles.previewBox}>
                <div
                  className={
                    styles.previewOverlay
                  }
                >
                  ▶ View Experience
                </div>
              </div>

              {/* MESSAGE */}
              <p className={styles.message}>
                {greeting.message}
              </p>

              {/* FOOTER */}
              <div className={styles.footer}>
                <button
                  className={styles.viewBtn}
                  onClick={() =>
                    window.open(
                      greeting.qrUrl,
                      "_blank"
                    )
                  }
                >
                  Open Greeting
                </button>

                <button
                  className={styles.deleteBtn}
                  onClick={() =>
                    handleDelete(
                      greeting.id
                    )
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Footer />
    </div>
    
  );
}