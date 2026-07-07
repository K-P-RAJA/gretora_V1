import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Ban, 
  CheckCircle, 
  Calendar,
  Gift,
  Video,
  Shield,
  ShieldAlert,
  AlertTriangle
} from "lucide-react";
import { getUsers, toggleUserBan } from "../../api/adminService";
import { useAlert } from "../../context/AlertContext";
import styles from "./AdminUsers.module.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Banning action states
  const [banningUser, setBanningUser] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  // Simple debounce logic for search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    loadUsers();
  }, [debouncedSearch]);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers(debouncedSearch);
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleBan(user) {
    setBanningUser(null);
    setActioningId(user.id);
    try {
      const nextBanStatus = !user.isBanned;
      await toggleUserBan(user.id, nextBanStatus);
      
      // Update local state instead of full reload for snappy feedback
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? { ...u, isBanned: nextBanStatus } : u
        )
      );
      
      await showAlert(`User "${user.name}" has been ${nextBanStatus ? "BANNED" : "UNBANNED"}.`, "success");
    } catch (err) {
      console.error(err);
      await showAlert(`Failed to toggle ban: ${err.message}`, "error");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>Manage profiles, check activity levels, and suspend accounts.</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name or email…"
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

      {/* Main Content Area */}
      {loading && users.length === 0 ? (
        <div className={styles.loadingArea}>
          <div className={styles.spinner}></div>
          <p>Retrieving user profiles…</p>
        </div>
      ) : error ? (
        <div className={styles.errorArea}>
          <AlertTriangle size={32} />
          <p>{error}</p>
          <button onClick={loadUsers} className={styles.retryBtn}>Retry</button>
        </div>
      ) : users.length === 0 ? (
        <div className={styles.emptyArea}>
          <Users size={40} className={styles.emptyIcon} />
          <h3>No Users Found</h3>
          <p>No user accounts matched the search criteria.</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Joined</th>
                  <th style={{ textAlign: "center" }}>Greetings</th>
                  <th style={{ textAlign: "center" }}>Videos</th>
                  <th>Status</th>
                  <th>Policy Accepted</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={`${styles.tableRow} ${user.isBanned ? styles.rowBanned : ""}`}>
                    {/* Profile Cell */}
                    <td className={styles.profileCell}>
                      <div className={styles.avatar}>
                        {user.name ? user.name.substring(0, 2).toUpperCase() : "??"}
                      </div>
                      <div>
                        <div className={styles.userName}>
                          {user.name || "Anonymous User"}
                          {user.isAdmin && (
                            <span className={styles.adminBadge} title="Administrator Account">
                              <Shield size={10} />
                              <span>Admin</span>
                            </span>
                          )}
                        </div>
                        <div className={styles.userEmail}>{user.email}</div>
                      </div>
                    </td>

                    {/* Joined Date Cell */}
                    <td>
                      <div className={styles.joinedDate}>
                        <Calendar size={13} />
                        <span>
                          {user.createdAt 
                            ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                            : "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Greetings Count */}
                    <td style={{ textAlign: "center" }}>
                      <span className={styles.statCount}>
                        <Gift size={12} className={styles.gIcon} />
                        {user.greetingsCount || 0}
                      </span>
                    </td>

                    {/* Videos Count */}
                    <td style={{ textAlign: "center" }}>
                      <span className={styles.statCount}>
                        <Video size={12} className={styles.vIcon} />
                        {user.videosCount || 0}
                      </span>
                    </td>

                    {/* Ban Status */}
                    <td>
                      {user.isBanned ? (
                        <span className={`${styles.badge} ${styles.badgeBanned}`}>
                          Banned
                        </span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeActive}`}>
                          Active
                        </span>
                      )}
                    </td>

                    {/* Policy Accepted */}
                    <td>
                      {user.hasAcceptedPolicy ? (
                        <span className={styles.policyAccepted} title="User has accepted community terms.">
                          <CheckCircle size={15} /> Yes
                        </span>
                      ) : (
                        <span className={styles.policyPending} title="Policy terms not yet completed.">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className={styles.actionsCell}>
                      {!user.isAdmin ? (
                        <button
                          className={user.isBanned ? styles.unbanBtn : styles.banBtn}
                          disabled={actioningId === user.id}
                          onClick={() => setBanningUser(user)}
                        >
                          <Ban size={13} />
                          <span>{user.isBanned ? "Unban User" : "Ban User"}</span>
                        </button>
                      ) : (
                        <span className={styles.immutableText} title="Admins cannot be banned.">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Banning Confirmation Modal */}
      {banningUser && (
        <div className={styles.modalOverlay} onClick={() => setBanningUser(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {banningUser.isBanned ? "Unban Account" : "Suspend Account"}
              </h3>
              <button className={styles.closeModal} onClick={() => setBanningUser(null)}>
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.warnIconWrap}>
                <ShieldAlert size={36} className={banningUser.isBanned ? styles.safeIcon : styles.dangerIcon} />
              </div>
              
              <h4>
                Are you sure you want to {banningUser.isBanned ? "restore" : "suspend"}{" "}
                <strong>{banningUser.name || banningUser.email}</strong>?
              </h4>
              
              <p className={styles.modalWarningText}>
                {banningUser.isBanned 
                  ? "Restoring this account allows the user to log back in, create new greetings, and browse current greetings."
                  : "Suspending this user will immediately log them out, block them from generating new QR codes/greetings, and display a suspension banner."}
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.modalCancelBtn} onClick={() => setBanningUser(null)}>
                Cancel
              </button>
              
              <button 
                className={banningUser.isBanned ? styles.modalConfirmUnbanBtn : styles.modalConfirmBanBtn}
                onClick={() => handleToggleBan(banningUser)}
              >
                {banningUser.isBanned ? "Confirm Unban" : "Confirm Suspension"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


