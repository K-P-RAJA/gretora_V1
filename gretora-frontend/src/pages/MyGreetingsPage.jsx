import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

      await updateGreeting(editingGreetingId, {
        title: editFormData.title,
        message: editFormData.message,
        occassion: editFormData.occassion,
        receiptantName: editFormData.receiptantName,
        videoId: videoId
      });

      await loadGreetings();
      handleEditCancel();
      await showAlert("Greeting updated successfully", "success");
    } catch (err) {
      console.error(err);
      await logClientError("Failed to update greeting in MyGreetingsPage", err.stack || err.message || err, {
        greetingId: editingGreetingId,
        hasNewVideo: !!newVideoFile
      });
      await showAlert("Failed to update greeting.", "error");
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

              {/* TELEMETRY */}
              <div className={styles.telemetryBar}>
                <div className={styles.telemetryItem}>
                  <span className={styles.telemetryLabel}>Total Scans</span>
                  <span className={styles.telemetryValue}>
                    📊 {greeting.scanCount ?? 0}
                  </span>
                </div>
                <div className={styles.telemetryItem}>
                  <span className={styles.telemetryLabel}>Status</span>
                  <span className={`${styles.statusBadge} ${styles[greeting.status?.toLowerCase().replace(" ", "")] || styles.active}`}>
                    {greeting.status === "Pending" ? "⏳ Under Review" : 
                     greeting.status === "Rejected" ? "✅ Safe" : 
                     greeting.status === "Reviewed" ? "👀 Reviewed" : 
                     "✨ Active"}
                  </span>
                </div>
              </div>

              {/* FOOTER */}
              <div className={styles.footer}>
                <button
                  className={styles.viewBtn}
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
                  Open Greeting
                </button>

                <button
                  className={styles.editBtn}
                  onClick={() => handleEditClick(greeting)}
                >
                  Edit
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

