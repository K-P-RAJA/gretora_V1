import { useEffect, useState, useMemo } from "react";
import { 
  Gift, 
  Search, 
  Trash2, 
  Calendar,
  User,
  AlertTriangle,
  Shield,
  ChevronDown,
  Layers,
  Lock
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
  const [expandedUsers, setExpandedUsers] = useState({});
  const [actioningId, setActioningId] = useState(null);

  // Search debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
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
      // Expand all by default on first load
      const initialExpanded = {};
      (data || []).forEach(g => {
        const key = g.creatorEmail || "Unknown";
        initialExpanded[key] = true;
      });
      setExpandedUsers(initialExpanded);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch greetings list. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Group greetings by user email
  const userGroups = useMemo(() => {
    const map = new Map();
    greetings.forEach((g) => {
      const email = g.creatorEmail || "Unknown / Unregistered";
      if (!map.has(email)) {
        map.set(email, {
          email,
          name: g.creatorName || "Anonymous User",
          greetings: []
        });
      }
      map.get(email).greetings.push(g);
    });
    return Array.from(map.values());
  }, [greetings]);

  const toggleUser = (email) => {
    setExpandedUsers(prev => ({
      ...prev,
      [email]: !prev[email]
    }));
  };

  const handleExpandAll = () => {
    const all = {};
    userGroups.forEach(u => { all[u.email] = true; });
    setExpandedUsers(all);
  };

  const handleCollapseAll = () => {
    setExpandedUsers({});
  };

  async function handleDelete(id, occasion, userEmail) {
    const confirmed = await showConfirm(
      `Permanently delete greeting ${id.substring(0, 8)}... (${occasion || "Greeting"}) created by ${userEmail}? The database record and any associated storage will be purged.`,
      "Moderate Greeting"
    );

    if (!confirmed) return;

    setActioningId(id);
    try {
      await deleteGreetingAdmin(id);
      setGreetings(prev => prev.filter(g => g.id !== id));
      await showAlert("Greeting successfully removed.", "success");
    } catch (err) {
      console.error(err);
      await showAlert(`Deletion failed: ${err.message}`, "error");
    } finally {
      setActioningId(null);
    }
  }

  const allExpanded = userGroups.length > 0 && userGroups.every(u => expandedUsers[u.email]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>User Greetings Management</h1>
          <p className={styles.subtitle}>
            Monitor and moderate active greetings grouped by user account.
          </p>
        </div>
      </header>

      {/* User Privacy Protection Banner */}
      <div className={styles.privacyBanner}>
        <Shield size={18} className={styles.privacyIcon} />
        <div>
          <strong>Privacy Protection Active:</strong> Personal greeting messages and private video playback streams are excluded from administrative logs to protect user confidentiality.
        </div>
      </div>

      {/* Control Panel */}
      <div className={styles.controls}>
        <div className={styles.toolbarRow}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Filter by user email, name, or occasion…"
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

          <div className={styles.toolbarActions}>
            <span className={styles.statsPill}>
              {userGroups.length} {userGroups.length === 1 ? "User" : "Users"} · {greetings.length} {greetings.length === 1 ? "Greeting" : "Greetings"}
            </span>

            {userGroups.length > 0 && (
              <button
                className={styles.toggleBtn}
                onClick={allExpanded ? handleCollapseAll : handleExpandAll}
              >
                {allExpanded ? "Collapse All" : "Expand All"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && greetings.length === 0 ? (
        <div className={styles.loadingArea}>
          <div className={styles.spinner}></div>
          <p>Retrieving user greeting catalog…</p>
        </div>
      ) : error ? (
        <div className={styles.errorArea}>
          <AlertTriangle size={32} />
          <p>{error}</p>
          <button onClick={loadGreetings} className={styles.retryBtn}>Retry</button>
        </div>
      ) : userGroups.length === 0 ? (
        <div className={styles.emptyArea}>
          <Gift size={40} className={styles.emptyIcon} />
          <h3>No Greetings Found</h3>
          <p>No user greetings matched your search filters.</p>
        </div>
      ) : (
        /* User-Wise Grouping */
        <div className={styles.userGroupsContainer}>
          {userGroups.map((group) => {
            const isExpanded = !!expandedUsers[group.email];
            const initial = (group.name || group.email || "U")[0].toUpperCase();

            return (
              <div key={group.email} className={styles.userCard}>
                <div
                  className={styles.userHeader}
                  onClick={() => toggleUser(group.email)}
                >
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {initial}
                    </div>
                    <div className={styles.userMeta}>
                      <span className={styles.userEmail}>{group.email}</span>
                      <span className={styles.userName}>{group.name}</span>
                    </div>
                  </div>

                  <div className={styles.userActions}>
                    <span className={styles.greetingBadge}>
                      {group.greetings.length} {group.greetings.length === 1 ? "Greeting" : "Greetings"}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`${styles.chevronIcon} ${isExpanded ? styles.chevronIconRotated : ""}`}
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.userContent}>
                    <div className={styles.tableResponsive}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Greeting ID</th>
                            <th>Occasion</th>
                            <th>Recipient</th>
                            <th>Created</th>
                            <th>Reports</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.greetings.map((g) => (
                            <tr key={g.id} className={styles.tableRow}>
                              <td>
                                <span className={styles.idLabel}>
                                  {g.id}
                                </span>
                              </td>
                              <td>
                                <span className={styles.occasionBadge}>
                                  {g.occasion || "General"}
                                </span>
                              </td>
                              <td className={styles.recipientCell}>
                                {g.recipient || "—"}
                              </td>
                              <td>
                                <div className={styles.dateWrap}>
                                  <Calendar size={13} />
                                  <span>
                                    {g.createdAt ? new Date(g.createdAt).toLocaleDateString() : "—"}
                                  </span>
                                </div>
                              </td>
                              <td>
                                {g.reportsCount > 0 ? (
                                  <span className={styles.alertReports}>
                                    ⚠️ {g.reportsCount} reported
                                  </span>
                                ) : (
                                  <span className={styles.cleanReports}>
                                    0 reports
                                  </span>
                                )}
                              </td>
                              <td className={styles.actionsCell}>
                                <button
                                  className={styles.deleteBtn}
                                  onClick={() => handleDelete(g.id, g.occasion, group.email)}
                                  disabled={actioningId === g.id}
                                  title="Delete Greeting"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className={styles.userContentFooter}>
                      <Lock size={12} />
                      <span>Greeting text messages and raw video media are private to this user.</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
