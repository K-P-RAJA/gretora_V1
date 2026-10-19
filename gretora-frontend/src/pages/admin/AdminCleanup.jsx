import { useCallback, useEffect, useState } from "react";
import { HardDrive, RefreshCw, ShieldAlert, Trash2 } from "lucide-react";
import { getGreetingCleanupPreview, triggerGreetingCleanup } from "../../api/adminService";
import styles from "./AdminCleanup.module.css";

function formatBytes(value = 0) {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index ? 2 : 0)} ${units[index]}`;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function AdminCleanup() {
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPreview(await getGreetingCleanupPreview());
    } catch (err) {
      console.error("Cleanup preview failed", err);
      setError("Could not load the cleanup preview.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPreview(); }, [loadPreview]);

  async function runCleanup() {
    const count = preview?.eligibleGreetingCount ?? 0;
    if (!window.confirm(`Permanently remove ${count} eligible retired greeting${count === 1 ? "" : "s"}? This cannot be undone.`)) return;

    setRunning(true);
    setError(null);
    try {
      const cleanupResult = await triggerGreetingCleanup();
      setResult(cleanupResult);
      await loadPreview();
    } catch (err) {
      console.error("Cleanup failed", err);
      setError("Cleanup could not be completed. No result was recorded.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Greeting retention cleanup</h1>
          <p>Expired greetings are retired first, then permanently removed after a four-day grace period. Permanent greetings are never included.</p>
        </div>
        <button className={styles.refreshButton} onClick={loadPreview} disabled={loading || running}>
          <RefreshCw size={16} className={loading ? styles.spinning : ""} /> Refresh preview
        </button>
      </header>

      {error && <div className={styles.error}><ShieldAlert size={18} /> {error}</div>}

      <section className={styles.summary}>
        <div className={styles.metric}>
          <Trash2 size={22} />
          <div><span>Eligible greetings</span><strong>{loading ? "…" : preview?.eligibleGreetingCount ?? 0}</strong></div>
        </div>
        <div className={styles.metric}>
          <HardDrive size={22} />
          <div><span>Storage to reclaim</span><strong>{loading ? "…" : formatBytes(preview?.reclaimableStorageBytes)}</strong></div>
        </div>
        <div className={styles.metric}>
          <RefreshCw size={22} />
          <div><span>Preview evaluated</span><strong className={styles.timestamp}>{loading ? "…" : formatDate(preview?.evaluatedAtUtc)}</strong></div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div><h2>Eligible sample records</h2><p>Oldest retired greetings scheduled for permanent removal.</p></div>
          <button className={styles.runButton} onClick={runCleanup} disabled={loading || running || !preview?.eligibleGreetingCount}>
            <Trash2 size={16} /> {running ? "Running cleanup…" : "Run cleanup"}
          </button>
        </div>
        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th>Greeting</th><th>Recipient</th><th>Expired</th><th>Video size</th><th>Storage reclaimed</th></tr></thead>
            <tbody>
              {!loading && !(preview?.samples?.length) && <tr><td colSpan="5" className={styles.empty}>No greetings are eligible for permanent removal.</td></tr>}
              {preview?.samples?.map(record => <tr key={record.id}>
                <td><strong>{record.title || "Untitled greeting"}</strong><small>{record.id}</small></td>
                <td>{record.recipientName || "—"}</td><td>{formatDate(record.expiresAt)}</td>
                <td>{formatBytes(record.storageBytes)}</td><td>{record.videoWillBeRemoved ? formatBytes(record.storageBytes) : "Shared video"}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </section>

      {result && <section className={styles.result}>
        <h2>Last execution result</h2>
        <p><strong>{result.deletedCount ?? 0}</strong> greetings permanently removed; <strong>{result.retiredCount ?? 0}</strong> newly retired; <strong>{formatBytes(result.reclaimedStorageBytes)}</strong> reclaimed.</p>
        <span>Executed {formatDate(result.executedAtUtc)}</span>
      </section>}
    </div>
  );
}
