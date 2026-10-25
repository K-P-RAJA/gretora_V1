import { useEffect, useState } from "react";
import { 
  Terminal, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Info, 
  X,
  FileText,
  RefreshCw,
  Trash2
} from "lucide-react";
import { getSystemLogs, deleteOldLogs } from "../../api/adminService";
import { useAlert } from "../../context/AlertContext";
import styles from "./AdminLogs.module.css";

export default function AdminLogs() {
  const { showAlert, showConfirm } = useAlert();
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [level, setLevel] = useState("");
  const [source, setSource] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [pruneDays, setPruneDays] = useState(30);
  
  // Selected log for showing full detail modal
  const [selectedLog, setSelectedLog] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Load logs on change
  useEffect(() => {
    loadLogs();
  }, [page, level, source, debouncedSearch]);

  async function loadLogs() {
    setLoading(true);
    setError(null);
    try {
      const data = await getSystemLogs(page, pageSize, level, source, debouncedSearch);
      setLogs(data?.logs || []);
      setTotalCount(data?.totalCount || 0);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch system logs.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteOldLogs() {
    const daysLabel = pruneDays === 0 ? "ALL system logs" : `system logs older than ${pruneDays} days`;
    const confirmed = await showConfirm(
      `Are you sure you want to permanently delete ${daysLabel}? This action cannot be undone.`,
      "Delete Old Logs"
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      const res = await deleteOldLogs(pruneDays);
      await showAlert(res?.statusMessage || "Logs pruned successfully.", "success");
      setPage(1);
      await loadLogs();
    } catch (err) {
      console.error(err);
      await showAlert(`Failed to delete logs: ${err.message || "Unknown error"}`, "error");
    } finally {
      setDeleting(false);
    }
  }

  function getLevelIcon(logLevel) {
    switch (logLevel?.toUpperCase()) {
      case "ERROR":
        return <AlertTriangle size={16} className={styles.errIcon} />;
      case "WARNING":
        return <AlertTriangle size={16} className={styles.warnIcon} />;
      default:
        return <Info size={16} className={styles.infoIcon} />;
    }
  }

  function getLevelClass(logLevel) {
    switch (logLevel?.toUpperCase()) {
      case "ERROR":
        return styles.rowError;
      case "WARNING":
        return styles.rowWarning;
      default:
        return "";
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>System Logs</h1>
          <p className={styles.subtitle}>Monitor backend failures, client-side crashes, and audit trails. (60 days auto-retention)</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.pruneControls}>
            <select
              value={pruneDays}
              onChange={(e) => setPruneDays(Number(e.target.value))}
              className={styles.pruneSelect}
              disabled={deleting || loading}
              title="Select cutoff age for logs"
            >
              <option value={7}>Older than 7 days</option>
              <option value={14}>Older than 14 days</option>
              <option value={30}>Older than 30 days</option>
              <option value={60}>Older than 60 days</option>
              <option value={0}>Clear all logs</option>
            </select>
            <button
              onClick={handleDeleteOldLogs}
              disabled={deleting || loading}
              className={styles.deleteLogsBtn}
              title="Delete old system logs"
            >
              <Trash2 size={16} />
              <span>{deleting ? "Deleting…" : "Delete Old Logs"}</span>
            </button>
          </div>
          <button onClick={loadLogs} className={styles.refreshBtn} title="Refresh Logs" disabled={loading}>
            <RefreshCw size={18} className={loading ? styles.spinning : ""} />
          </button>
        </div>
      </header>

      {/* Filters and Search */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchWrap}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search logs or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.selectsWrap}>
          <div className={styles.selectWrapper}>
            <Filter size={14} className={styles.filterIcon} />
            <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }} className={styles.select}>
              <option value="">All Levels</option>
              <option value="INFO">Info</option>
              <option value="WARNING">Warning</option>
              <option value="ERROR">Error</option>
            </select>
          </div>

          <div className={styles.selectWrapper}>
            <Terminal size={14} className={styles.filterIcon} />
            <select value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }} className={styles.select}>
              <option value="">All Sources</option>
              <option value="Backend">Backend</option>
              <option value="Frontend">Frontend</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* Logs Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "80px" }}>Level</th>
              <th style={{ width: "100px" }}>Source</th>
              <th>Message</th>
              <th style={{ width: "180px" }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className={styles.loadingCell}>Loading logs...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="4" className={styles.emptyCell}>No logs match the current criteria.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr 
                  key={log.id} 
                  className={`${styles.logRow} ${getLevelClass(log.level)}`}
                  onClick={() => setSelectedLog(log)}
                >
                  <td className={styles.levelCell}>
                    <span className={styles.iconLabel}>
                      {getLevelIcon(log.level)}
                      {log.level}
                    </span>
                  </td>
                  <td>
                    <span className={log.source === "Backend" ? styles.sourceBackend : styles.sourceFrontend}>
                      {log.source}
                    </span>
                  </td>
                  <td className={styles.messageCell}>
                    <div className={styles.messageText}>{log.message}</div>
                    {log.details && <span className={styles.hasDetails}><FileText size={12} /> View Details</span>}
                  </td>
                  <td className={styles.timeCell}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            disabled={page === 1} 
            onClick={() => setPage(prev => prev - 1)} 
            className={styles.pageBtn}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {totalPages} ({totalCount} total logs)
          </span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(prev => prev + 1)} 
            className={styles.pageBtn}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className={styles.modalOverlay} onClick={() => setSelectedLog(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <div className={styles.modalTitleWrap}>
                {getLevelIcon(selectedLog.level)}
                <h2>Log Details</h2>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedLog(null)}>
                <X size={20} />
              </button>
            </header>
            <div className={styles.modalBody}>
              <div className={styles.metaGrid}>
                <div>
                  <strong>Level:</strong> <span className={styles.metaVal}>{selectedLog.level}</span>
                </div>
                <div>
                  <strong>Source:</strong> <span className={styles.metaVal}>{selectedLog.source}</span>
                </div>
                <div className={styles.fullWidthMeta}>
                  <strong>Timestamp:</strong> <span className={styles.metaVal}>{new Date(selectedLog.created_at).toString()}</span>
                </div>
              </div>

              <div className={styles.section}>
                <h3>Message</h3>
                <div className={styles.messageBlock}>{selectedLog.message}</div>
              </div>

              {selectedLog.details && (
                <div className={styles.section}>
                  <h3>Details / Stack Trace</h3>
                  <pre className={styles.detailsBlock}>{selectedLog.details}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
