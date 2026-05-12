import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./HomePage.module.css";

import { uploadVideo } from "../api/videoService";
import { createGreeting } from "../api/greetingService";

import AppNavbar from "../components/AppNavbar";
import Footer from "../components/Footer";

export default function HomePage() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [recipientName, setRecipientName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [message, setMessage] = useState("");

  const [videoFile, setVideoFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please upload a valid video.");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      alert("Video must be below 100MB.");
      return;
    }

    setVideoFile(file);
  };

  const handleGenerateGreeting = async () => {
    try {
      if (
        !recipientName ||
        !occasion ||
        !message ||
        !videoFile
      ) {
        alert("Please complete all fields.");
        return;
      }

      setLoading(true);

      const uploadRes = await uploadVideo(videoFile);

      const greetingRes = await createGreeting({
        videoId: uploadRes.videoId,
        title: `${occasion} for ${recipientName}`,
        message: message,
        Occassion: occasion,
        ReceiptantName: recipientName,
      });

      navigate(`/greeting/${greetingRes.greetingId}`, {
        state: {
          qrUrl: greetingRes.qrUrl,
          recipientName,
          occasion,
          message,
        },
      });
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgGlowOne}></div>
      <div className={styles.bgGlowTwo}></div>

      {/* PREMIUM NAVBAR */}
      <AppNavbar />

      <main className={styles.heroSection}>
        {/* LEFT SIDE */}
        <section className={styles.leftPanel}>
          <div className={styles.heroCard}>
            <div className={styles.heroBadge}>
              ✨ Personalized Video Greeting Cards
            </div>

            <h2>
              Turn your memories into
              <span> magical surprise cards</span>
            </h2>

            <p>
              Upload a heartfelt video, write a
              meaningful message, and instantly
              create a premium QR greeting
              experience your loved ones will
              never forget.
            </p>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <strong>10k+</strong>
                <span>Greetings Shared</span>
              </div>

              <div className={styles.heroStat}>
                <strong>4.9★</strong>
                <span>User Experience</span>
              </div>

              <div className={styles.heroStat}>
                <strong>100%</strong>
                <span>Personalized</span>
              </div>
            </div>
          </div>

          {/* LIVE PREVIEW */}
          <div className={styles.previewCard}>
            <div className={styles.previewTop}>
              <div>
                <p className={styles.previewLabel}>
                  Greeting Preview
                </p>

                <h3>
                  {occasion ||
                    "Birthday Surprise"}
                </h3>
              </div>

              <div className={styles.liveBadge}>
                Live Preview
              </div>
            </div>

            <div className={styles.previewGreeting}>
              <div
                className={
                  styles.previewRibbonVertical
                }
              ></div>

              <div
                className={
                  styles.previewRibbonHorizontal
                }
              ></div>

              <div className={styles.previewInner}>
                <p className={styles.previewSmall}>
                  A special greeting for
                </p>

                <h2>
                  {recipientName ||
                    "Someone Special"}
                </h2>

                <div
                  className={
                    styles.previewDivider
                  }
                >
                  <span></span>
                  <div></div>
                  <span></span>
                </div>

                <p
                  className={
                    styles.previewMessage
                  }
                >
                  {message ||
                    "Your heartfelt message will appear beautifully here for your loved one."}
                </p>

                <div
                  className={styles.previewQr}
                ></div>

                <p className={styles.previewScan}>
                  Scan to unwrap your surprise
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className={styles.rightPanel}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <div>
                <p className={styles.formMini}>
                  CREATE YOUR CARD
                </p>

                <h2>Create Greeting</h2>
              </div>

              <div className={styles.formIcon}>
                🎁
              </div>
            </div>

            {/* RECIPIENT */}
            <div className={styles.formGroup}>
              <label>
                Recipient Name
              </label>

              <input
                type="text"
                placeholder="Enter recipient name"
                value={recipientName}
                onChange={(e) =>
                  setRecipientName(
                    e.target.value
                  )
                }
              />
            </div>

            {/* OCCASION */}
            <div className={styles.formGroup}>
              <label>Occasion</label>

              <input
                type="text"
                placeholder="Birthday, Wedding, Anniversary..."
                value={occasion}
                onChange={(e) =>
                  setOccasion(
                    e.target.value
                  )
                }
              />
            </div>

            {/* MESSAGE */}
            <div className={styles.formGroup}>
              <label>
                Greeting Message
              </label>

              <textarea
                rows="5"
                placeholder="Write your heartfelt message..."
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
              ></textarea>
            </div>

            {/* VIDEO */}
            <div className={styles.uploadCard}>
              <input
                type="file"
                accept="video/*"
                hidden
                ref={fileInputRef}
                onChange={handleVideoUpload}
              />

              <div className={styles.uploadLeft}>
                <div className={styles.uploadIcon}>
                  {videoFile ? "✓" : "▶"}
                </div>

                <div>
                  <h3>
                    {videoFile
                      ? "Video Ready"
                      : "Upload Video"}
                  </h3>

                  <p>
                    {videoFile
                      ? videoFile.name
                      : "MP4 or MOV up to 100MB"}
                  </p>
                </div>
              </div>

              <button
                className={styles.uploadBtn}
                onClick={() =>
                  fileInputRef.current.click()
                }
              >
                {videoFile
                  ? "Change"
                  : "Choose File"}
              </button>
            </div>

            {/* GENERATE */}
            <button
              className={styles.generateBtn}
              onClick={
                handleGenerateGreeting
              }
            >
              {loading
                ? "Generating Greeting..."
                : "Generate QR Greeting"}
            </button>
          </div>

          {/* FEATURES */}
          <div className={styles.sideGrid}>
            <div className={styles.infoCard}>
              <span>🎉</span>

              <strong>
                Instant Sharing
              </strong>

              <p>
                Send beautiful greeting cards
                with a scannable QR.
              </p>
            </div>

            <div className={styles.infoCard}>
              <span>🎥</span>

              <strong>
                Video Memories
              </strong>

              <p>
                Turn ordinary wishes into
                emotional experiences.
              </p>
            </div>

            <div className={styles.infoCard}>
              <span>💜</span>

              <strong>
                Made for Gifts
              </strong>

              <p>
                Perfect for birthdays,
                anniversaries & surprises.
              </p>
            </div>

            <div className={styles.infoCard}>
              <span>⚡</span>

              <strong>Fast & Easy</strong>

              <p>
                Create premium greeting cards
                in under a minute.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}