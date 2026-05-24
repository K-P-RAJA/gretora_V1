import { useEffect, useState } from "react";
import { 
  AlertCircle, 
  Check, 
  Trash2, 
  X, 
  Filter, 
  Calendar,
  MessageSquare,
  Search,
  ExternalLink
} from "lucide-react";
import { getReports, updateReportStatus, deleteGreetingAdmin } from "../../api/adminService";
import { useAlert } from "../../context/AlertContext";
import styles from "./AdminReports.module.css";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const { showAlert, showConfirm } = useAlert();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFilter, setCurrentFilter] = useState("Pending"); // Default to Pending for focus
  
  // Modals / Details State
  const [selectedReport, setSelectedReport] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    loadReportData();
  }, [currentFilter]);

  async function loadReportData() {
    setLoading(true);
    setError(null);
    try {
      const data = await getReports(currentFilter);
      setReports(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(reportId, newStatus) {
    setActioningId(reportId);
    try {
      await updateReportStatus(reportId, newStatus);
      // Reload reports
      await loadReportData();
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
      await showAlert(`Report status updated to ${newStatus}.`, "success");
    } catch (err) {
      console.error(err);
      await showAlert(`Failed to update report: ${err.message}`, "error");
    } finally {
      setActioningId(null);
    }
  }

  async function handleRemoveContent(reportId, greetingId) {
    const confirmed = await showConfirm(
      "Are you absolutely sure you want to permanently delete this greeting and its video from storage? This action is irreversible.",
      "Remove Reported Content"
    );

    if (!confirmed) return;

    setActioningId(reportId);
    try {
      // Step 1: Delete greeting (cascades or cleans up)
      await deleteGreetingAdmin(greetingId);
      
      // Step 2: Set report status to Removed
      await updateReportStatus(reportId, "Removed");

      // Reload
      await loadReportData();
      setSelectedReport(null);
      await showAlert("Content removed and video permanently deleted from storage.", "success");
    } catch (err) {
      console.error(err);
      await showAlert(`Failed to remove content: ${err.message}`, "error");
    } finally {
      setActioningId(null);
    }
  }

  const filters = [
    { label: "Pending", value: "Pending" },
    { label: "Reviewed", value: "Reviewed" },
    { label: "Rejected (Safe)", value: "Rejected" },
    { label: "Removed Content", value: "Removed" },
    { label: "All Reports", value: "All" }
  ];

  function getStatusStyle(status) {
    switch (status) {
      case "Pending": return styles.badgePending;
      case "Reviewed": return styles.badgeReviewed;
      case "Rejected": return styles.badgeRejected;
      case "Removed": return styles.badgeRemoved;
      default: return "";
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Misuse Reports</h1>
          <p className={styles.subtitle}>Review and moderate content reported by community users.</p>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className={styles.filtersArea}>
        <div className={styles.tabs}>
          {filters.map((f) => (
            <button
              key={f.value}
              className={`${styles.tab} ${currentFilter === f.value ? styles.tabActive : ""}`}
              onClick={() => setCurrentFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className={styles.loadingArea}>
          <div className={styles.spinner}></div>
          <p>Fetching flagged content list…</p>
        </div>
      ) : error ? (
        <div className={styles.errorArea}>
          <AlertCircle size={32} />
          <p>{error}</p>
          <button onClick={loadReportData} className={styles.retryBtn}>Retry</button>
        </div>
      ) : reports.length === 0 ? (
        <div className={styles.emptyArea}>
          <div className={styles.emptyIconWrap}>
            <Check size={28} />
          </div>
          <h3>All Clear!</h3>
          <p>No reports found in the "{currentFilter}" category.</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Greeting</th>
                  <th>Reason</th>
                  <th>Details</th>
                  <th>Reported At</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className={styles.tableRow}>
                    <td className={styles.greetingCell}>
                      {report.greetingTitle ? (
                        <div>
                          <div className={styles.greetingTitle}>{report.greetingTitle}</div>
                          <div className={styles.creatorMeta}>
                            by {report.creatorName || "Unknown"} ({report.creatorEmail || "N/A"})
                          </div>
                        </div>
                      ) : (
                        <div className={styles.deletedText}>Deleted Greeting</div>
                      )}
                    </td>
                    
                    <td className={styles.reasonCell}>
                      <span className={styles.reasonText}>{report.reason}</span>
                    </td>

                    <td className={styles.detailsCell}>
                      {report.details ? (
                        <button 
                          className={styles.viewDetailsBtn}
                          onClick={() => setSelectedReport(report)}
                        >
                          View Snippet
                        </button>
                      ) : (
                        <span className={styles.noDetails}>None</span>
                      )}
                    </td>

                    <td className={styles.dateCell}>
                      <div className={styles.dateTime}>
                        <Calendar size={12} />
                        <span>{new Date(report.reportedAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    <td>
                      <span className={`${styles.statusBadge} ${getStatusStyle(report.status)}`}>
                        {report.status}
                      </span>
                    </td>

                    <td className={styles.actionsCell}>
                      <div className={styles.actionButtons}>
                        {report.status === "Pending" && (
                          <>
                            <button
                              title="Mark Reviewed"
                              className={styles.actionBtnCheck}
                              disabled={actioningId === report.id}
                              onClick={() => handleUpdateStatus(report.id, "Reviewed")}
                            >
                              <Check size={16} />
                            </button>

                            <button
                              title="Reject Report (Keep Safe)"
                              className={styles.actionBtnReject}
                              disabled={actioningId === report.id}
                              onClick={() => handleUpdateStatus(report.id, "Rejected")}
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}

                        {report.greetingId && report.status !== "Removed" && (
                          <button
                            title="Remove Content (Delete Video)"
                            className={styles.actionBtnTrash}
                            disabled={actioningId === report.id}
                            onClick={() => handleRemoveContent(report.id, report.greetingId)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Dialog Modal */}
      {selectedReport && (
        <div className={styles.modalOverlay} onClick={() => setSelectedReport(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Report Specifications</h3>
              <button className={styles.closeModal} onClick={() => setSelectedReport(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.metaRow}>
                <strong>Greeting Title:</strong>
                <span>{selectedReport.greetingTitle || "Deleted"}</span>
              </div>
              <div className={styles.metaRow}>
                <strong>Category:</strong>
                <span className={styles.reasonText}>{selectedReport.reason}</span>
              </div>
              <div className={styles.metaRow}>
                <strong>Creator Profile:</strong>
                <span>{selectedReport.creatorName || "N/A"} ({selectedReport.creatorEmail || "N/A"})</span>
              </div>
              <div className={styles.metaRow}>
                <strong>Flagged On:</strong>
                <span>{new Date(selectedReport.reportedAt).toLocaleString()}</span>
              </div>

              <div className={styles.detailsBlock}>
                <strong>Details provided by reporter:</strong>
                <p>{selectedReport.details}</p>
              </div>

              {selectedReport.videoUrl && (
                <div style={{ marginTop: "20px" }}>
                  <strong style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
                    Reported Video Preview:
                  </strong>
                  <div style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16/9",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    background: "#000",
                    border: "1px solid var(--glass-border)",
                    boxShadow: "var(--shadow-brand)"
                  }}>
                    <video 
                      controls 
                      src={selectedReport.videoUrl} 
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              {selectedReport.status === "Pending" && (
                <>
                  <button
                    className={styles.modalBtnReject}
                    onClick={() => handleUpdateStatus(selectedReport.id, "Rejected")}
                  >
                    Reject Report
                  </button>
                  <button
                    className={styles.modalBtnReviewed}
                    onClick={() => handleUpdateStatus(selectedReport.id, "Reviewed")}
                  >
                    Mark Reviewed
                  </button>
                </>
              )}

              {selectedReport.greetingId && selectedReport.status !== "Removed" && (
                <button
                  className={styles.modalBtnRemove}
                  onClick={() => handleRemoveContent(selectedReport.id, selectedReport.greetingId)}
                >
                  <Trash2 size={16} /> Delete Greeting & Video
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
