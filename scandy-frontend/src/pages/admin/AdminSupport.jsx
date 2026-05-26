import { useEffect, useState } from "react";
import {
  Mail,
  Search,
  Check,
  RotateCcw,
  Trash2,
  Calendar,
  MessageSquare,
  Copy,
  ExternalLink,
  CheckCircle,
  Inbox,
  Clock,
  User
} from "lucide-react";
import { getSupportTickets, updateSupportTicket, deleteSupportTicket } from "../../api/adminService";
import { useAlert } from "../../context/AlertContext";
import styles from "./AdminSupport.module.css";

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const { showAlert, showConfirm } = useAlert();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering & Search
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);
    setError(null);
    try {
      const data = await getSupportTickets();
      setTickets(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch support tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(ticketId, currentStatus) {
    const nextStatus = currentStatus === "Pending" ? "Resolved" : "Pending";
    
    // Snappy prompt if resolving
    if (nextStatus === "Resolved") {
      const confirmed = await showConfirm(
        "Mark this support ticket as Resolved? Ensure you have replied to the customer if needed.",
        "Resolve Ticket"
      );
      if (!confirmed) return;
    }

    setActioningId(ticketId);
    try {
      await updateSupportTicket(ticketId, nextStatus);
      
      setTickets(prev =>
        prev.map(t => (t.id === ticketId ? { ...t, status: nextStatus } : t))
      );
      
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status: nextStatus }));
      }

      await showAlert(`Ticket successfully marked as ${nextStatus.toUpperCase()}.`, "success");
    } catch (err) {
      console.error(err);
      await showAlert(`Failed to update ticket: ${err.message}`, "error");
    } finally {
      setActioningId(null);
    }
  }

  async function handleDeleteTicket(ticketId) {
    const confirmed = await showConfirm(
      "Are you absolutely sure you want to permanently delete this support ticket? This action is irreversible.",
      "Delete Ticket"
    );

    if (!confirmed) return;

    setActioningId(ticketId);
    try {
      await deleteSupportTicket(ticketId);
      
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
      
      await showAlert("Support ticket permanently deleted.", "success");
    } catch (err) {
      console.error(err);
      await showAlert(`Failed to delete ticket: ${err.message}`, "error");
    } finally {
      setActioningId(null);
    }
  }

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      await showAlert(`${label || "Text"} copied to clipboard!`, "success");
    } catch (err) {
      await showAlert("Failed to copy text.", "error");
    }
  };

  // Stats computation
  const pendingCount = tickets.filter(t => t.status === "Pending").length;
  const resolvedCount = tickets.filter(t => t.status === "Resolved").length;
  const totalCount = tickets.length;

  // Filter and Search tickets
  const filteredTickets = tickets.filter(t => {
    // Status Filter
    if (statusFilter !== "All" && t.status !== statusFilter) {
      return false;
    }
    
    // Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const nameMatch = t.name?.toLowerCase().includes(q);
      const emailMatch = t.email?.toLowerCase().includes(q);
      const subjectMatch = t.subject?.toLowerCase().includes(q);
      const messageMatch = t.message?.toLowerCase().includes(q);
      return nameMatch || emailMatch || subjectMatch || messageMatch;
    }
    
    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Support Tickets</h1>
          <p className={styles.subtitle}>View, manage, and reply to user inquiries and help requests.</p>
        </div>
      </header>

      {/* Stats Cards Section */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard} onClick={() => setStatusFilter("All")} style={{ cursor: "pointer" }}>
          <div className={`${styles.iconWrap} ${styles.iconTotal}`}>
            <Inbox size={22} />
          </div>
          <div>
            <div className={styles.statVal}>{totalCount}</div>
            <div className={styles.statLbl}>Total Inquiries</div>
          </div>
        </div>

        <div className={styles.statCard} onClick={() => setStatusFilter("Pending")} style={{ cursor: "pointer" }}>
          <div className={`${styles.iconWrap} ${styles.iconPending}`}>
            <Clock size={22} />
          </div>
          <div>
            <div className={styles.statVal}>{pendingCount}</div>
            <div className={styles.statLbl}>Pending Review</div>
          </div>
        </div>

        <div className={styles.statCard} onClick={() => setStatusFilter("Resolved")} style={{ cursor: "pointer" }}>
          <div className={`${styles.iconWrap} ${styles.iconResolved}`}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div className={styles.statVal}>{resolvedCount}</div>
            <div className={styles.statLbl}>Resolved Tickets</div>
          </div>
        </div>
      </section>

      {/* Filter and Search controls */}
      <div className={styles.controls}>
        <div className={styles.filterTabs}>
          <button
            onClick={() => setStatusFilter("Pending")}
            className={`${styles.filterBtn} ${statusFilter === "Pending" ? styles.activeFilter : ""}`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter("Resolved")}
            className={`${styles.filterBtn} ${statusFilter === "Resolved" ? styles.activeFilter : ""}`}
          >
            Resolved ({resolvedCount})
          </button>
          <button
            onClick={() => setStatusFilter("All")}
            className={`${styles.filterBtn} ${statusFilter === "All" ? styles.activeFilter : ""}`}
          >
            All Tickets ({totalCount})
          </button>
        </div>

        <div className={styles.searchWrap}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search tickets by sender, email, subject..."
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

      {loading ? (
        <div className={styles.loadingArea}>
          <div className={styles.spinner}></div>
          <p>Fetching support tickets inbox...</p>
        </div>
      ) : error ? (
        <div className={styles.errorArea}>
          <p>{error}</p>
          <button onClick={loadTickets} className={styles.retryBtn}>
            Retry
          </button>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className={styles.emptyArea}>
          <div className={styles.emptyIconWrap}>
            <Inbox size={28} />
          </div>
          <h3>Inbox is empty</h3>
          <p>No support tickets match the current filter or search criteria.</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Message Preview</th>
                  <th>Received At</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className={`${styles.tableRow} ${selectedTicket?.id === ticket.id ? styles.selectedRow : ""}`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <td>
                      <div className={styles.senderInfo}>
                        <div className={styles.avatar}>
                          <User size={14} />
                        </div>
                        <div>
                          <div className={styles.senderName}>{ticket.name}</div>
                          <div className={styles.senderEmail}>{ticket.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.subjectText}>{ticket.subject || "(No Subject)"}</div>
                    </td>
                    <td className={styles.messagePreviewCell}>
                      <div className={styles.messagePreview}>
                        {ticket.message}
                      </div>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <div className={styles.dateTime}>
                        <Calendar size={12} style={{ marginRight: 4 }} />
                        {formatDate(ticket.createdAt)}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          ticket.status === "Resolved" ? styles.resolvedBadge : styles.pendingBadge
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()} style={{ textAlign: "right" }}>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleToggleStatus(ticket.id, ticket.status)}
                          disabled={actioningId === ticket.id}
                          className={`${styles.actionBtn} ${
                            ticket.status === "Resolved" ? styles.reopenBtn : styles.resolveBtn
                          }`}
                          title={ticket.status === "Resolved" ? "Re-open inquiry" : "Mark as resolved"}
                        >
                          {ticket.status === "Resolved" ? <RotateCcw size={14} /> : <Check size={14} />}
                        </button>

                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          disabled={actioningId === ticket.id}
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          title="Delete Ticket"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ticket Details Panel Modal Overlay */}
      {selectedTicket && (
        <div className={styles.detailOverlay} onClick={() => setSelectedTicket(null)}>
          <div className={styles.detailPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitleGroup}>
                <span className={`${styles.badge} ${
                  selectedTicket.status === "Resolved" ? styles.resolvedBadge : styles.pendingBadge
                }`}>
                  {selectedTicket.status}
                </span>
                <h3>Support Ticket Details</h3>
              </div>
              <button className={styles.closePanelBtn} onClick={() => setSelectedTicket(null)}>
                ✕
              </button>
            </div>

            <div className={styles.panelBody}>
              <div className={styles.detailGroup}>
                <label>Customer Name</label>
                <div className={styles.valueRow}>
                  <span>{selectedTicket.name}</span>
                  <button 
                    className={styles.copyBtn} 
                    onClick={() => copyToClipboard(selectedTicket.name, "Name")}
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              <div className={styles.detailGroup}>
                <label>Customer Email</label>
                <div className={styles.valueRow}>
                  <a href={`mailto:${selectedTicket.email}?subject=Re: ${encodeURIComponent(selectedTicket.subject || "Scandy Support inquiry")}`} className={styles.emailLink}>
                    {selectedTicket.email}
                    <ExternalLink size={12} style={{ marginLeft: 4 }} />
                  </a>
                  <div className={styles.btnRow}>
                    <button 
                      className={styles.copyBtn} 
                      onClick={() => copyToClipboard(selectedTicket.email, "Email")}
                      title="Copy Email Address"
                    >
                      <Copy size={12} />
                    </button>
                    <a 
                      href={`mailto:${selectedTicket.email}?subject=Re: ${encodeURIComponent(selectedTicket.subject || "Scandy Support inquiry")}`}
                      className={styles.replyEmailBtn}
                      title="Send response email"
                    >
                      <Mail size={12} style={{ marginRight: 4 }} />
                      Reply
                    </a>
                  </div>
                </div>
              </div>

              <div className={styles.detailGroup}>
                <label>Subject</label>
                <div className={styles.subjectDetail}>{selectedTicket.subject || "(No Subject)"}</div>
              </div>

              <div className={styles.detailGroup}>
                <label>Received At</label>
                <div className={styles.dateDetail}>
                  {formatDate(selectedTicket.createdAt)}
                </div>
              </div>

              <div className={styles.detailGroup}>
                <label>Message Content</label>
                <div className={styles.messageBox}>{selectedTicket.message}</div>
              </div>
            </div>

            <div className={styles.panelFooter}>
              <button
                onClick={() => handleToggleStatus(selectedTicket.id, selectedTicket.status)}
                disabled={actioningId === selectedTicket.id}
                className={`${styles.footerActionBtn} ${
                  selectedTicket.status === "Resolved" ? styles.footerReopenBtn : styles.footerResolveBtn
                }`}
              >
                {selectedTicket.status === "Resolved" ? (
                  <>
                    <RotateCcw size={16} style={{ marginRight: 6 }} />
                    Re-open Ticket
                  </>
                ) : (
                  <>
                    <Check size={16} style={{ marginRight: 6 }} />
                    Mark as Resolved
                  </>
                )}
              </button>

              <button
                onClick={() => handleDeleteTicket(selectedTicket.id)}
                disabled={actioningId === selectedTicket.id}
                className={`${styles.footerActionBtn} ${styles.footerDeleteBtn}`}
              >
                <Trash2 size={16} style={{ marginRight: 6 }} />
                Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
