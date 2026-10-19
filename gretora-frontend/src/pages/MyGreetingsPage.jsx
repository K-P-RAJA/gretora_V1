import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCode } from "react-qrcode-logo";
import Footer from "../components/Footer";

import {
  getMyGreetings,
  deleteGreeting,
  updateGreeting
} from "../api/greetingService";
import { uploadVideo } from "../api/videoService";
import { logClientError } from "../api/logService";
import { useAlert } from "../context/AlertContext";

import AppNavbar from "../components/AppNavbar";
import LoadingScreen from "../components/LoadingScreen";

import styles from "./MyGreetingsPage.module.css";

export default function MyGreetingsPage() {
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useAlert();

  const [greetings, setGreetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingGreetingId, setEditingGreetingId] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadGreetings();
  }, []);

  async function loadGreetings() {
    try {
      const data = await getMyGreetings();

      setGreetings(data);
    } catch (err) {
      console.error(err);
      await logClientError("Failed to load greetings in MyGreetingsPage", err.stack || err.message || err);
      await showAlert("Failed to load greetings", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = await showConfirm(
      "Are you sure you want to delete this greeting?",
      "Delete Greeting"
    );

    if (!confirmed) return;

    try {
      await deleteGreeting(id);

      setGreetings((prev) =>
        prev.filter((g) => g.id !== id)
      );
      await showAlert("Greeting deleted successfully", "success");
    } catch (err) {
      console.error(err);
      await logClientError("Failed to delete greeting in MyGreetingsPage", err.stack || err.message || err, { greetingId: id });
      await showAlert("Failed to delete greeting", "error");
    }
  }

  const handleEditClick = (greeting) => {
    setEditingGreetingId(greeting.id);
    setEditFormData({
      title: greeting.title,
      message: greeting.message,
      occassion: greeting.occassion,
      receiptantName: greeting.receiptantName,
      videoUrl: greeting.videoUrl
    });
    setNewVideoFile(null);
  };

  const handleEditCancel = () => {
    setEditingGreetingId(null);
    setEditFormData(null);
    setNewVideoFile(null);
  };

  const handleDeleteReplaceVideo = async () => {
    const confirmed = await showConfirm("This action cannot be undone. Are you sure you want to delete the previous video and upload a new one?", "Replace Video");
    if (confirmed) {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const handleVideoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      await showAlert("Please upload a valid video.", "warning");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      await showAlert("Video must be below 100MB.", "warning");
      return;
    }
    setNewVideoFile(file);
    setEditFormData(prev => ({...prev, videoUrl: null}));
  };

  const handleEditSave = async () => {
    try {
      setIsSaving(true);

      if (editFormData.message && editFormData.message.length > 300) {
        await showAlert("Greeting message cannot exceed 300 characters.", "warning");
        setIsSaving(false);
        return;
      }
      
      let videoId = null;
      if (newVideoFile) {
        const uploadRes = await uploadVideo(newVideoFile);
        videoId = uploadRes.videoId;
      }

      const cleanRecipient = editFormData.receiptantName || editFormData.recipientName;
      const cleanOccasion = editFormData.occassion || editFormData.occasion;

      const updatedTitle = cleanRecipient 
        ? `${cleanOccasion || 'Greeting'} for ${cleanRecipient}` 
        : editFormData.title;

      await updateGreeting(editingGreetingId, {
        title: updatedTitle,
        message: editFormData.message,
        occasion: cleanOccasion,
        recipientName: cleanRecipient,
        occassion: cleanOccasion,
        receiptantName: cleanRecipient,
        Occassion: cleanOccasion,
        ReceiptantName: cleanRecipient,
        videoId: videoId
      });

      await loadGreetings();
      handleEditCancel();
      await showAlert("Greeting updated successfully", "success");
    } catch (err) {
      console.error(err);
      const isNetworkErr = err.message?.includes("fetch") || err.message?.includes("Network") || err.message?.includes("Load failed");
      if (!isNetworkErr) {
        await logClientError("Failed to update greeting in MyGreetingsPage", err.stack || err.message || err, {
          greetingId: editingGreetingId,
          hasNewVideo: !!newVideoFile
        });
      }
      await showAlert(isNetworkErr ? "Network error. Please try again." : "Failed to update greeting.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading your greetings..." />;
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

      {/* GREETINGS GRID OR EMPTY STATE */}
      {greetings.length === 0 ? (
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
          {greetings.map((greeting) => {
            const isPermanent = Boolean(greeting.isPermanent);
            const isExpired = !isPermanent && (greeting.isDeleted || (greeting.expiresAt && new Date(greeting.expiresAt) < new Date()));
            const expiresDateStr = greeting.expiresAt ? new Date(greeting.expiresAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "";
            const createdDateStr = greeting.createdAt ? new Date(greeting.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";
            
            return (
              <div
                key={greeting.id}
                className={`${styles.card} ${isPermanent ? styles.permanentCard : ""} ${isExpired ? styles.expiredCard : ""}`}
              >
                {/* TOP HEADER: BADGES & OCCASION */}
                <div className={styles.cardHeader}>
                  <div className={styles.occasionBadge}>
                    <span className={styles.occasionDot}></span>
                    {greeting.occassion || "Special Greeting"}
                  </div>

                  {isPermanent ? (
                    <div className={styles.permanentPill}>
                      <span className={styles.pillIcon}>🔒</span> Permanent Vault
                    </div>
                  ) : isExpired ? (
                    <div className={styles.expiredPill}>
                      <span className={styles.pillIcon}>⚠️</span> Expired
                    </div>
                  ) : (
                    <div className={styles.activePill}>
                      <span className={styles.pillIcon}>●</span> Active
                    </div>
                  )}
                </div>

                {/* RECIPIENT & TITLE BLOCK */}
                <div className={styles.cardIdentity}>
                  <div className={styles.recipientRow}>
                    <span className={styles.recipientLabel}>Recipient</span>
                    <h3 className={styles.recipientName}>
                      {greeting.receiptantName || "Someone Special"}
                    </h3>
                  </div>
                  <h2 className={styles.cardTitle}>{greeting.title || "Surprise Video Card"}</h2>
                </div>

                {/* DIGITAL EXPERIENCE QR & META SHOWCASE */}
                <div
                  className={styles.experienceShowcase}
                  onClick={() =>
                    navigate(`/greeting/${greeting.id}`, {
                      state: {
                        qrUrl: greeting.qrUrl,
                        recipientName: greeting.receiptantName,
                        occasion: greeting.occassion,
                        message: greeting.message
                      }
                    })
                  }
                >
                  <div className={styles.qrPlate}>
                    <QRCode
                      value={greeting.qrUrl || `https://Gretora.com/g/${greeting.id}`}
                      size={86}
                      bgColor="#ffffff"
                      fgColor="#18181b"
                      qrStyle="dots"
                      eyeRadius={[6, 6, 6, 6]}
                      eyeColor="#6366f1"
                    />
                  </div>

                  <div className={styles.showcaseDetails}>
                    <div className={styles.showcaseMetaTag}>Interactive QR Greeting</div>
                    <p className={styles.showcaseHint}>
                      Tap to launch full-screen receiver surprise & QR page
                    </p>
                    <div className={styles.launchLink}>
                      <span>Open Experience</span>
                      <span className={styles.arrowIcon}>→</span>
                    </div>
                  </div>
                </div>

                {/* HEARTFELT MESSAGE SNIPPET */}
                {greeting.message ? (
                  <div className={styles.messageSnippet}>
                    <span className={styles.quoteSymbol}>“</span>
                    <p className={styles.messageText}>{greeting.message}</p>
                  </div>
                ) : (
                  <div className={styles.messageSnippetEmpty}>
                    <span className={styles.emptyNote}>No written note attached to this greeting.</span>
                  </div>
                )}

                {/* METRICS & RETENTION STRIP */}
                <div className={styles.metaStrip}>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Total Scans</span>
                    <span className={styles.metricValue}>
                      <strong>{greeting.scanCount ?? 0}</strong> views
                    </span>
                  </div>
                  <div className={styles.metricDivider}></div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Retention Window</span>
                    <span className={isPermanent ? styles.retentionPermanent : isExpired ? styles.retentionExpired : styles.metricValue}>
                      {isPermanent ? "Never Expires" : isExpired ? "Ended" : (expiresDateStr ? `Until ${expiresDateStr}` : "3 Days")}
                    </span>
                  </div>
                  {createdDateStr && (
                    <>
                      <div className={styles.metricDivider}></div>
                      <div className={styles.metricItem}>
                        <span className={styles.metricLabel}>Created</span>
                        <span className={styles.metricDate}>{createdDateStr}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* PERMANENT / EXPIRED INFORMATIVE BANNERS */}
                {isPermanent && (
                  <div className={styles.permanentNoticeBanner}>
                    🛡️ Preserved forever in your vault. Editing is locked.
                  </div>
                )}

                {isExpired && (
                  <div className={styles.expiredNoticeBanner}>
                    ⚠️ Free 3-day viewing window expired. Video playback paused.
                  </div>
                )}

                {/* ACTION CONTROLS */}
                <div className={styles.cardActions}>
                  <button
                    className={styles.primaryActionBtn}
                    onClick={() =>
                      navigate(`/greeting/${greeting.id}`, {
                        state: {
                          qrUrl: greeting.qrUrl,
                          recipientName: greeting.receiptantName,
                          occasion: greeting.occassion,
                          message: greeting.message
                        }
                      })
                    }
                  >
                    View Details
                  </button>

                  {!isPermanent && !isExpired && (
                    <button
                      className={styles.secondaryActionBtn}
                      onClick={() => handleEditClick(greeting)}
                    >
                      Edit
                    </button>
                  )}

                  {isExpired && (
                    <button
                      className={styles.restoreActionBtn}
                      onClick={() => showAlert("Premium feature to regain greetings coming soon!", "info")}
                    >
                      Restore
                    </button>
                  )}

                  <button
                    className={styles.deleteActionBtn}
                    title="Delete greeting"
                    onClick={() => handleDelete(greeting.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT MODAL */}
      {editingGreetingId && editFormData && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Edit Greeting</h2>
            
            <div className={styles.formGroup}>
              <label>Recipient Name</label>
              <input type="text" value={editFormData.receiptantName} onChange={e => setEditFormData({...editFormData, receiptantName: e.target.value})} />
            </div>
            
            <div className={styles.formGroup}>
              <label>Occasion</label>
              <input type="text" value={editFormData.occassion} onChange={e => setEditFormData({...editFormData, occassion: e.target.value})} />
            </div>

            <div className={styles.formGroup}>
              <label>Title</label>
              <input type="text" value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} />
            </div>

            <div className={styles.formGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ margin: 0 }}>Message</label>
                <span style={{ 
                  fontSize: '11px', 
                  color: (editFormData.message || '').length >= 270 ? '#ef4444' : '#a1a1aa',
                  fontWeight: '600'
                }}>
                  {(editFormData.message || '').length} / 300 characters
                </span>
              </div>
              <textarea 
                rows="4" 
                value={editFormData.message || ''} 
                maxLength={300}
                onChange={e => setEditFormData({...editFormData, message: e.target.value})}
              ></textarea>
            </div>

            <div className={styles.videoReplaceSection}>
              <label>Video</label>
              {editFormData.videoUrl ? (
                <div className={styles.currentVideo}>
                  <video src={editFormData.videoUrl} controls className={styles.previewVideo}></video>
                  <button className={styles.deleteVideoBtn} onClick={handleDeleteReplaceVideo}>Delete & Replace Video</button>
                </div>
              ) : newVideoFile ? (
                <div className={styles.currentVideo}>
                  <p>New Video: {newVideoFile.name}</p>
                  <button className={styles.changeVideoBtn} onClick={() => fileInputRef.current.click()}>Change Video</button>
                </div>
              ) : (
                <div className={styles.currentVideo}>
                  <p>No video selected.</p>
                  <button className={styles.changeVideoBtn} onClick={() => fileInputRef.current.click()}>Upload Video</button>
                </div>
              )}
              <input type="file" accept="video/*" hidden ref={fileInputRef} onChange={handleVideoSelect} />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={handleEditCancel} disabled={isSaving}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleEditSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
    
  );
}

