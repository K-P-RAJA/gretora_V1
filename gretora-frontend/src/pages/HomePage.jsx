import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCode } from "react-qrcode-logo";
import { getProfile } from "../api/UserService";

import styles from "./HomePage.module.css";

import { uploadVideo } from "../api/videoService";
import { createGreeting, getMyGreetings } from "../api/greetingService";
import { useAlert } from "../context/AlertContext";

import AppNavbar from "../components/AppNavbar";
import Footer from "../components/Footer";
import InfoModal from "../components/InfoModal";

export default function HomePage() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [showTermsModal, setShowTermsModal] = useState(false);

  const fileInputRef = useRef(null);

  const [recipientName, setRecipientName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [message, setMessage] = useState("");

  const [videoFile, setVideoFile] = useState(null);

  const [loading, setLoading] = useState(false);
  
  const [profile, setProfile] = useState(null);
  const [cardOpened, setCardOpened] = useState(false);
  const [greetingsCount, setGreetingsCount] = useState(0);

  useEffect(() => {
    async function loadProfileAndGreetings() {
      try {
        const p = await getProfile();
        setProfile(p);
        
        const greetings = await getMyGreetings();
        setGreetingsCount(greetings.length);
      } catch (err) {
        console.error("Failed to load user profile or greetings count:", err);
      }
    }
    loadProfileAndGreetings();
  }, []);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      await showAlert("Please upload a valid video.", "warning");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      await showAlert("Video size must be below 50MB.", "warning");
      return;
    }

    setVideoFile(file);
  };

  const handleGenerateGreeting = async () => {
    try {
      if (greetingsCount >= 3) {
        await showAlert("You have already used your free quota of 3 greetings. You can delete an older greeting card from your dashboard or upgrade to a subscription.", "warning");
        return;
      }

      if (
        !recipientName ||
        !occasion ||
        !message ||
        !videoFile
      ) {
        await showAlert("Please complete all fields.", "warning");
        return;
      }

      if (message.length > 300) {
        await showAlert("Greeting message cannot exceed 300 characters.", "warning");
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

      const greetingId = greetingRes.greetingId || greetingRes.greetingid;
      const qrUrl = greetingRes.qrUrl || greetingRes.qrurl;

      navigate(`/greeting/${greetingId}`, {
        state: {
          qrUrl: qrUrl,
          recipientName,
          occasion,
          message,
        },
      });
    } catch (err) {
      console.error(err);
      await showAlert(err.message || "Something went wrong.", "error");
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
              <div className={styles.right}>
                <div className={styles.cardStage}>
                  <div 
                    className={`${styles.cardContainer} ${cardOpened ? styles.opened : ''}`} 
                    onClick={() => { if (!cardOpened) setCardOpened(true); }}
                  >
                    {/* INSIDE RIGHT PAGE (Permanently fixed in background) */}
                    <div className={styles.cardBack}>
                      <div className={styles.displayFrame}>
                        <div className={styles.qrInteraction}>
                          <div className={styles.frameHeader}>Scan to Reveal</div>
                          
                          <div className={styles.qrGlass}>
                            <div className={styles.qrWrapper}>
                               <QRCode
                                 value="https://Gretora.com/g/demo"
                                 size={120}
                                 bgColor="transparent"
                                 fgColor="#2a1610"
                                 qrStyle="dots"
                                 eyeRadius={8}
                                 eyeColor="#b48c50"
                                 logoImage="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2I0OGM1MCI+PHBhdGggZD0iTTEyIDIxLjM1bC0xLjQ1LTEuMzJDNS40IDE1LjM2IDIgMTIuMjggMiA4LjVDMiA1LjQyIDQuNDIgMyA3LjUgM2MxLjc0IDAgMy40MS44MSA0LjUgMi4wOUMxMy4wOSAzLjgxIDE0Ljc2IDMgMTYuNSAzbDMuMDggMGMzLjA4IDAgNS41IDIuNDIgNS41IDUuNSAwIDMuNzgtMy40IDYuODYtOC41NSAxMS41NEwxMiAyMS4zNXoiLz48L3N2Zz4="
                                 logoWidth={24}
                                 logoHeight={24}
                                 logoPadding={3}
                                 logoPaddingStyle="circle"
                                 removeQrCodeBehindLogo={true}
                               />
                            </div>
                          </div>
                          
                          <div className={styles.playHint}>
                            Recipient scans to play video
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* FRONT FOLDING FLAP (folds open around left axis) */}
                    <div className={styles.cardFront}>
                      {/* INSIDE LEFT PAGE (Back of the front cover - visible when card is open) */}
                      <div className={styles.cardFrontInside}>
                        {/* Decorative Corner Ornaments */}
                        <div className={`${styles.ornament} ${styles.topLeft}`}></div>
                        <div className={`${styles.ornament} ${styles.topRight}`}></div>
                        <div className={`${styles.ornament} ${styles.bottomLeft}`}></div>
                        <div className={`${styles.ornament} ${styles.bottomRight}`}></div>

                        <div className={styles.brandHeader}>
                          <span className={styles.brandLogo}>Gretora</span>
                          <span className={styles.tag}>Premium Greetings</span>
                        </div>

                        <div className={styles.recipientBlock}>
                          <h2 className={styles.occasionText}>{occasion || "Birthday Surprise"}</h2>
                          <p className={styles.smallLabel}>FOR</p>
                          <h1 className={styles.recipientName}>{recipientName || "Someone Special"}</h1>
                          <div className={styles.goldDivider}></div>
                        </div>

                        <div className={styles.messageBlock}>
                          <p className={styles.messageText}>
                            {message || "Your heartfelt message will appear beautifully here for your loved one."}
                          </p>
                        </div>

                        <div className={styles.waxSeal}>
                          <span>S</span>
                        </div>
                        
                        <span className={styles.signature}>With love, {profile?.name || "Sender"}</span>
                      </div>

                      {/* OUTSIDE COVER PAGE (Visible when closed) */}
                      <div className={styles.cardFrontOutside}>
                        <div className={styles.coverText}>
                          <h2>For<br/>{recipientName || "Someone\nSpecial"}</h2>
                        </div>
                        {!cardOpened && <div className={styles.tapPrompt}>Tap to fold open</div>}
                      </div>
                    </div>
                    
                  </div>
                </div>

                {/* Close button outside 3D context so pointer-events always work */}
                {cardOpened && (
                  <button
                    className={styles.closeCardBtn}
                    onClick={() => setCardOpened(false)}
                  >
                    ✕ Close Card
                  </button>
                )}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ margin: 0 }}>Greeting Message</label>
                <span style={{ 
                  fontSize: '11px', 
                  fontFamily: "'Lato', sans-serif",
                  color: message.length >= 270 ? '#ef4444' : '#a1a1aa',
                  fontWeight: '600'
                }}>
                  {message.length} / 300 characters
                </span>
              </div>

              <textarea
                rows="5"
                placeholder="Write your heartfelt message..."
                value={message}
                maxLength={300}
                onChange={(e) => setMessage(e.target.value)}
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

            <p className={styles.policyDisclaimer}>
              By generating a greeting, you acknowledge that you are solely
              responsible for the uploaded video content and agree to our{" "}
              <a href="#terms" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}>Terms of Service</a>.
              Gretora accepts no liability for user-generated content.
            </p>
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
      {showTermsModal && (
        <InfoModal type="terms" onClose={() => setShowTermsModal(false)} />
      )}
    </div>
  );
}

