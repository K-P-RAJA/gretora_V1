import { useEffect, useState } from "react";
import { 
  Users, 
  Gift, 
  Video, 
  AlertOctagon, 
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  XCircle,
  ArrowRight,
  QrCode,
  Globe
} from "lucide-react";
import { getDashboardStats } from "../../api/adminService";
import { useNavigate } from "react-router-dom";
import styles from "./AdminDashboard.module.css";

function getFlagEmoji(countryCode) {
  if (!countryCode) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map(char => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌐";
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading analytics data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertOctagon size={48} className={styles.errorIcon} />
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      sub: stats?.usersGrowth ? `+${stats.usersGrowth} new (7d)` : "0 new (7d)",
      icon: <Users size={22} />,
      color: "violet",
      path: "/admin/users"
    },
    {
      title: "Active Greetings",
      value: stats?.totalGreetings || 0,
      sub: "Greetings created",
      icon: <Gift size={22} />,
      color: "pink",
      path: "/admin/greetings"
    },
    {
      title: "QR Codes Generated",
      value: stats?.totalQrCodes || 0,
      sub: "Active physical QR links",
      icon: <QrCode size={22} />,
      color: "violet",
      path: "/admin/greetings"
    },
    {
      title: "Total QR Scans",
      value: stats?.totalScans || 0,
      sub: "All surprise watch views",
      icon: <TrendingUp size={22} />,
      color: "teal",
      path: "/admin/greetings"
    },
    {
      title: "Stored Videos",
      value: stats?.totalVideos || 0,
      sub: "In Cloudflare R2",
      icon: <Video size={22} />,
      color: "teal",
      path: "/admin/greetings"
    },
    {
      title: "Pending Reports",
      value: stats?.reports?.pending ?? 0,
      sub: stats?.reports?.pending > 0 ? "Requires attention" : "System clean",
      icon: <AlertOctagon size={22} />,
      color: stats?.reports?.pending > 0 ? "red" : "gray",
      path: "/admin/reports",
      pulse: stats?.reports?.pending > 0
    }
  ];

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard Overview</h1>
          <p className={styles.subtitle}>Welcome to the Scandy admin administration terminal.</p>
        </div>
      </header>

      {/* Grid Stats */}
      <section className={styles.statsGrid}>
        {statCards.map((card, idx) => (
          <div 
            key={idx} 
            className={`${styles.statCard} ${styles[card.color]} ${card.pulse ? styles.pulseCard : ""}`}
            onClick={() => navigate(card.path)}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{card.title}</span>
              <div className={styles.iconWrap}>{card.icon}</div>
            </div>
            <div className={styles.cardBody}>
              <h2 className={styles.cardValue}>{card.value}</h2>
              <span className={styles.cardSub}>{card.sub}</span>
            </div>
            <div className={styles.cardFooter}>
              <span>Manage</span>
              <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </section>

      {/* Reports Summary & Activity Section */}
      <div className={styles.detailsGrid}>
        {/* Misuse Reports Health */}
        <div className={styles.detailsCard}>
          <h3 className={styles.cardHeading}>Reports Summary</h3>
          
          <div className={styles.reportsSummaryWrap}>
            <div className={styles.circularProgressArea}>
              <div className={styles.bigCircle}>
                <div className={styles.innerValue}>
                  <h2>{stats?.reports?.total || 0}</h2>
                  <span>Total Reports</span>
                </div>
              </div>
            </div>

            <div className={styles.reportBreakdown}>
              <div className={styles.breakdownItem}>
                <div className={styles.labelColor} style={{ backgroundColor: "#FBBF24" }} />
                <span className={styles.breakdownName}>Pending</span>
                <span className={styles.breakdownValue}>{stats?.reports?.pending || 0}</span>
              </div>
              <div className={styles.breakdownItem}>
                <div className={styles.labelColor} style={{ backgroundColor: "#7C6EF8" }} />
                <span className={styles.breakdownName}>Reviewed</span>
                <span className={styles.breakdownValue}>{stats?.reports?.reviewed || 0}</span>
              </div>
              <div className={styles.breakdownItem}>
                <div className={styles.labelColor} style={{ backgroundColor: "#34D399" }} />
                <span className={styles.breakdownName}>Rejected (Safe)</span>
                <span className={styles.breakdownValue}>{stats?.reports?.rejected || 0}</span>
              </div>
              <div className={styles.breakdownItem}>
                <div className={styles.labelColor} style={{ backgroundColor: "#EF4444" }} />
                <span className={styles.breakdownName}>Removed Content</span>
                <span className={styles.breakdownValue}>{stats?.reports?.removed || 0}</span>
              </div>
            </div>
          </div>
          
          <button 
            className={styles.actionBtn}
            onClick={() => navigate("/admin/reports")}
          >
            Review Flagged Items
          </button>
        </div>

        {/* Server Status Health */}
        <div className={styles.detailsCard}>
          <h3 className={styles.cardHeading}>System Integrity</h3>
          <div className={styles.systemList}>
            <div className={styles.systemItem}>
              <div className={styles.sysMeta}>
                <CheckCircle size={18} className={styles.sysActive} />
                <span>Supabase Database</span>
              </div>
              <span className={styles.sysStatus}>Operational</span>
            </div>
            
            <div className={styles.systemItem}>
              <div className={styles.sysMeta}>
                <CheckCircle size={18} className={styles.sysActive} />
                <span>Cloudflare R2 Storage</span>
              </div>
              <span className={styles.sysStatus}>Operational</span>
            </div>

            <div className={styles.systemItem}>
              <div className={styles.sysMeta}>
                <CheckCircle size={18} className={styles.sysActive} />
                <span>ASP.NET Core backend</span>
              </div>
              <span className={styles.sysStatus}>Operational</span>
            </div>

            <div className={styles.systemItem}>
              <div className={styles.sysMeta}>
                <ShieldCheck size={18} className={styles.sysActive} />
                <span>Policy Enforcement</span>
              </div>
              <span className={styles.sysStatus}>Strict Mode</span>
            </div>
          </div>

          <div className={styles.securityBanner}>
            <h4>Administrator Notice</h4>
            <p>Ensure all reported greetings are reviewed promptly. Content violating copyright, safety, or community terms should be removed within 24 hours.</p>
          </div>
        </div>
      </div>

      {/* QR Codes Scan Analytics & Geography */}
      {((stats?.recentScans && stats.recentScans.length > 0) || (stats?.topCountries && stats.topCountries.length > 0)) && (
        <div className={styles.detailsGrid} style={{ marginTop: "24px" }}>
          
          {/* Recent Scans Activity */}
          <div className={styles.detailsCard}>
            <h3 className={styles.cardHeading}>Recent QR Scans</h3>
            <div className={styles.systemList}>
              {stats.recentScans.map((scan, index) => (
                <div key={scan.id || index} className={styles.systemItem}>
                  <div className={styles.sysMeta}>
                    <span style={{ fontSize: "20px", marginRight: "8px" }} title={scan.countryCode || "Unknown"}>
                      {getFlagEmoji(scan.countryCode)}
                    </span>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "14px" }}>
                        {scan.greetingTitle || "Personalized Gift"}
                      </div>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                        Scanned at {new Date(scan.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-dim)", fontWeight: "600" }}>
                    {new Date(scan.scannedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Geographical Analytics */}
          <div className={styles.detailsCard}>
            <h3 className={styles.cardHeading}>Geographical Traffic</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {stats.topCountries.map((country, index) => {
                const total = stats.totalScans || 1;
                const percentage = Math.round((country.scanCount / total) * 100);
                return (
                  <div key={country.countryCode || index} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "18px" }}>{getFlagEmoji(country.countryCode)}</span>
                        <span style={{ fontWeight: "700", textTransform: "uppercase" }}>{country.countryCode || "Other"}</span>
                      </div>
                      <span style={{ color: "var(--text-muted)", fontWeight: "600" }}>
                        {country.scanCount} scans ({percentage}%)
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "6px", backgroundColor: "var(--bg-elevated)", borderRadius: "10px", overflow: "hidden" }}>
                      <div 
                        style={{ 
                          width: `${percentage}%`, 
                          height: "100%",
                          borderRadius: "10px",
                          backgroundColor: index === 0 ? "var(--brand)" : index === 1 ? "var(--accent-pink)" : "var(--accent-teal)" 
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
