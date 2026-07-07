import { useEffect, useState } from "react";
import { 
  Gift, 
  Search, 
  Trash2, 
  Play, 
  Calendar,
  User,
  AlertTriangle,
  X,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { getGreetings, deleteGreetingAdmin } from "../../api/adminService";
import { useAlert } from "../../context/AlertContext";
import styles from "./AdminGreetings.module.css";

export default function AdminGreetings() {
  const [greetings, setGreetings] = useState([]);
  const { showAlert, showConfirm } = useAlert();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Preview & Action states
  const [previewGreeting, setPreviewGreeting] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  // Search debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 450);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    loadGreetings();
  }, [debouncedSearch]);

  async function loadGreetings() {
    setLoading(true);
    setError(null);
    try {
      const data = await getGreetings(debouncedSearch);
      setGreetings(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch greetings list. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, title) {
    const confirmed = await showConfirm(
      `Are you absolutely sure you want to permanently delete the greeting "${title}"? This will delete the database record and purge its media file from storage.`,
      "Moderate Greeting"
    );

    if (!confirmed) return;

    setActioningId(id);
    try {
      await deleteGreetingAdmin(id);
      setGreetings(prev => prev.filter(g => g.id !== id));
      await showAlert("Greeting successfully deleted.", "success");
    } catch (err) {
      console.error(err);
      await showAlert(`Deletion failed: ${err.message}`, "error");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Greetings Database</h1>
          <p className={styles.subtitle}>Browse, preview, and moderate all active video greetings.</p>
        </div>
      </header>

      {/* Control Panel */}
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by title, occasion, or creator…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button className={styles.clearSearch} onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content list */}
      {loading && greetings.length === 0 ? (
        <div className={styles.loadingArea}>
          <div className={styles.spinner}></div>
          <p>Retrieving greeting catalog…</p>
        </div>
      ) : error ? (
        <div className={styles.errorArea}>
          <AlertTriangle size={32} />
          <p>{error}</p>
          <button onClick={loadGreetings} className={styles.retryBtn}>Retry</button>
        </div>
      ) : greetings.length === 0 ? (
        <div className={styles.emptyArea}>
          <Gift size={40} className={styles.emptyIcon} />
          <h3>No Greetings Found</h3>
          <p>We couldn't find any greetings matching your search parameters.</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Greeting</th>
                  <th>Occasion</th>
                  <th>Recipient</th>
                  <th>Creator</th>
                  <th>Date Created</th>
                  <th style={{ textAlign: "center" }}>Reports</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {greetings.map((g) => (
                  <tr key={g.id} className={styles.tableRow}>
                    {/* Title cell */}
                    <td className={styles.titleCell}>
                      <div className={styles.greetingHeader}>
                        <span className={styles.greetingTitle}>{g.title || "Untitled"}</span>
                        {g.videoUrl && (
                          <button 
                            className={styles.previewBtn} 
                            onClick={() => setPreviewGreeting(g)}
                            title="Play Video Greeting"
                          >
                            <Play size={10} fill="currentColor" /> Preview
                          </button>
                        )}
                      </div>
                      <span className={styles.idLabel}>{g.id}</span>
                    </td>

                    {/* Occasion */}
                    <td>
                      <span className={styles.occasionBadge}>{g.occasion || "General"}</span>
                    </td>

                    {/* Recipient */}
                    <td className={styles.recipientCell}>
                      {g.recipient || "Someone"}
                    </td>

                    {/* Creator profile */}
                    <td className={styles.creatorCell}>
                      <div>
                        <div className={styles.creatorName}>{g.creatorName || "Anonymous"}</div>
                        <div className={styles.creatorEmail}>{g.creatorEmail || "N/A"}</div>
                      </div>
                    </td>

                    {/* Date */}
                    <td>
                      <div className={styles.dateWrap}>
                        <Calendar size={13} />
                        <span>
                          {g.createdAt 
                            ? new Date(g.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                            : "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Reports count badge */}
                    <td style={{ textAlign: "center" }}>
                      {g.reportsCount > 0 ? (
                        <span className={styles.alertReports} title={`${g.reportsCount} active report flags!`}>
                          {g.reportsCount}
                        </span>
                      ) : (
                        <span className={styles.cleanReports}>0</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className={styles.actionsCell}>
                      <button
                        title="Delete Greeting Permanently"
                        className={styles.deleteBtn}
                        disabled={actioningId === g.id}
                        onClick={() => handleDelete(g.id, g.title)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewGreeting && (
        <div className={styles.modalOverlay} onClick={() => setPreviewGreeting(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <Sparkles size={16} className={styles.modalSparkle} />
                <span>Greeting Preview</span>
              </h3>
              <button className={styles.closeModal} onClick={() => setPreviewGreeting(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <h2 className={styles.modalGreetingTitle}>{previewGreeting.title}</h2>
              
              <div className={styles.videoWrapper}>
                <video 
                  controls 
                  autoPlay 
                  className={styles.videoPlayer}
                  src={previewGreeting.videoUrl}
                >
                  Your browser does not support playing C# video streams.
                </video>
              </div>

              <div className={styles.videoMeta}>
                <div className={styles.metaField}>
                  <strong>Occasion:</strong>
                  <span>{previewGreeting.occasion}</span>
                </div>
                <div className={styles.metaField}>
                  <strong>Recipient:</strong>
                  <span>{previewGreeting.recipient}</span>
                </div>
                <div className={styles.metaField}>
                  <strong>Created by:</strong>
                  <span>{previewGreeting.creatorName} ({previewGreeting.creatorEmail})</span>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <a 
                href={`/g/${previewGreeting.id}`}
                target="_blank" 
                rel="noreferrer" 
                className={styles.externalLink}
              >
                <span>Open Public Page</span>
                <ExternalLink size={14} />
              </a>

              <button 
                className={styles.modalDeleteBtn}
                onClick={() => {
                  const id = previewGreeting.id;
                  const title = previewGreeting.title;
                  setPreviewGreeting(null);
                  handleDelete(id, title);
                }}
              >
                Delete Greeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


