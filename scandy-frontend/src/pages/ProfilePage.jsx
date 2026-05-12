import { useEffect, useState } from "react";

import AppNavbar from "../components/AppNavbar";
import Footer from "../components/Footer";

import { getProfileDashboard } from "../api/UserService";

import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data =
        await getProfileDashboard();

      // ✅ CHECK API RESPONSE
      if (data.statusCode !== 1) {
        throw new Error(
          data.statusMessage
        );
      }

      setProfile(data);
    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date) {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        Loading profile...
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgGlowOne}></div>
      <div className={styles.bgGlowTwo}></div>

      <AppNavbar />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>
            {profile?.name
              ?.charAt(0)
              ?.toUpperCase() || "S"}
          </div>

          <div>
            <p className={styles.profileMini}>
              SCANDY CREATOR
            </p>

            <h1>
              {profile?.name || "Scandy User"}
            </h1>

            <p className={styles.email}>
              {profile?.email}
            </p>

            <p className={styles.joined}>
              Member since{" "}
              {formatDate(
                profile?.createdAt
              )}
            </p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span>🎁</span>

          <strong>
            {profile?.greetingsCount || 0}
          </strong>

          <p>Greetings Created</p>
        </div>

        <div className={styles.statCard}>
          <span>🎥</span>

          <strong>
            {profile?.videosCount || 0}
          </strong>

          <p>Videos Uploaded</p>
        </div>

        <div className={styles.statCard}>
          <span>✨</span>

          <strong>Premium</strong>

          <p>Creator Status</p>
        </div>
      </section>

      {/* RECENT */}
      <section className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionMini}>
              RECENT ACTIVITY
            </p>

            <h2>
              Recent Greetings
            </h2>
          </div>
        </div>

        {!profile?.recentGreetings ||
        profile.recentGreetings.length ===
          0 ? (
          <div className={styles.emptyCard}>
            No greetings created yet.
          </div>
        ) : (
          <div className={styles.recentGrid}>
            {profile.recentGreetings.map(
              (greeting, index) => (
                <div
                  key={index}
                  className={
                    styles.recentCard
                  }
                >
                  <div
                    className={
                      styles.recentTop
                    }
                  >
                    <div
                      className={
                        styles.occasionTag
                      }
                    >
                      {
                        greeting.occassion
                      }
                    </div>
                  </div>

                  <h3>
                    {greeting.title}
                  </h3>

                  <p>
                    Created{" "}
                    {new Date(
                      greeting.createdAt
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
} 