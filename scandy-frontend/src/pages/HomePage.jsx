import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./HomePage.module.css";

import { uploadVideo } from "../api/videoService";
import { createGreeting } from "../api/greetingService";

export default function HomePage() {

  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  // FORM STATES
  const [recipientName, setRecipientName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [message, setMessage] = useState("");

  // VIDEO
  const [videoFile, setVideoFile] = useState(null);

  // LOADING
  const [loading, setLoading] = useState(false);

  // VIDEO SELECT
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

  // GENERATE
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

      // 1️⃣ Upload video
      const uploadRes = await uploadVideo(videoFile);

      // 2️⃣ Create greeting
      const greetingRes = await createGreeting({
        videoId: uploadRes.videoId,
        title: `${occasion} for ${recipientName}`,
        message: message,
        Occassion:occasion,
        ReceiptantName:recipientName
      });

      // 3️⃣ Navigate
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

      {/* NAVBAR */}
      <header className={styles.navbar}>

        <div className={styles.logo}>
          Scan<em>dy</em>
        </div>

        <div className={styles.navActions}>

          <button className={styles.navBtn}>
            My Greetings
          </button>

          <button className={styles.profileBtn}>
            Y
          </button>

        </div>

      </header>

      {/* DASHBOARD */}
      <main className={styles.dashboard}>

        {/* LEFT SIDE */}
        <section className={styles.leftSection}>

          <div className={styles.welcomeCard}>

            <span className={styles.welcomeBadge}>
              QR Video Greetings
            </span>

            <h1>
              Create meaningful greetings
              with videos & QR codes
            </h1>

            <p>
              Upload a personal video, write your message,
              and instantly generate a shareable QR greeting card.
            </p>

          </div>

          {/* CREATE CARD */}
          <div className={styles.formCard}>

            <div className={styles.cardHeader}>

              <div>
                <h2>Create Greeting</h2>
                <p>
                  Fill in the details below
                </p>
              </div>

            </div>

            {/* RECIPIENT */}
            <div className={styles.formGroup}>

              <label>Recipient Name</label>

              <input
                type="text"
                placeholder="Enter recipient name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />

            </div>

            {/* OCCASION */}
            <div className={styles.formGroup}>

              <label>Occasion</label>

              <input
                type="text"
                placeholder="Birthday, Wedding, Anniversary..."
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
              />

            </div>

            {/* MESSAGE */}
            <div className={styles.formGroup}>

              <label>Greeting Message</label>

              <textarea
                rows="5"
                placeholder="Write your heartfelt message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>

            </div>

            {/* VIDEO */}
            <div className={styles.uploadBox}>

              <input
                type="file"
                accept="video/*"
                hidden
                ref={fileInputRef}
                onChange={handleVideoUpload}
              />

              <div className={styles.uploadTop}>

                <div className={styles.uploadIcon}>
                  {videoFile ? "✓" : "↑"}
                </div>

                <div>

                  <h3>
                    {videoFile
                      ? "Video Selected"
                      : "Upload Greeting Video"}
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
                onClick={() => fileInputRef.current.click()}
              >
                {videoFile
                  ? "Change Video"
                  : "Choose Video"}
              </button>

            </div>

            {/* BUTTON */}
            <button
              className={styles.generateBtn}
              onClick={handleGenerateGreeting}
            >
              {loading
                ? "Generating..."
                : "Generate QR Greeting"}
            </button>

          </div>

        </section>

        {/* RIGHT SIDE */}
        <aside className={styles.rightSection}>

          {/* STATS */}
          <div className={styles.sideCard}>

            <h3>Quick Overview</h3>

            <div className={styles.statList}>

              <div className={styles.statItem}>
                <span>Total Greetings</span>
                <strong>12</strong>
              </div>

              <div className={styles.statItem}>
                <span>Videos Uploaded</span>
                <strong>8</strong>
              </div>

              <div className={styles.statItem}>
                <span>Shared This Month</span>
                <strong>24</strong>
              </div>

            </div>

          </div>

          {/* TIPS */}
          <div className={styles.sideCard}>

            <h3>Tips</h3>

            <ul className={styles.tipList}>

              <li>
                Keep videos under 60 seconds for faster sharing
              </li>

              <li>
                Use personal messages to make greetings memorable
              </li>

              <li>
                QR greetings work great for gifts and surprise cards
              </li>

            </ul>

          </div>

          {/* RECENT */}
          <div className={styles.sideCard}>

            <h3>Recent Activity</h3>

            <div className={styles.activityItem}>
              Birthday greeting created
            </div>

            <div className={styles.activityItem}>
              Anniversary QR shared
            </div>

            <div className={styles.activityItem}>
              Wedding video uploaded
            </div>

          </div>

        </aside>

      </main>

    </div>
  );
}