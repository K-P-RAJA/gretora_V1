import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Flag, 
  Users, 
  Gift, 
  ArrowLeft, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { logoutUser } from "../api/authService";
import styles from "./AdminSidebar.module.css";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard size={20} />
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: <Flag size={20} />
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <Users size={20} />
    },
    {
      name: "Greetings",
      path: "/admin/greetings",
      icon: <Gift size={20} />
    }
  ];

  async function handleLogout() {
    try {
      await logoutUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileLogo} onClick={() => navigate("/home")}>
          Scan<em>dy</em> <span className={styles.adminBadge}>Admin</span>
        </div>
        <button className={styles.hamburger} onClick={toggleSidebar}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && <div className={styles.overlay} onClick={toggleSidebar}></div>}

      {/* Sidebar Container */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
        {/* Brand / Logo */}
        <div className={styles.logoArea} onClick={() => navigate("/home")}>
          <div className={styles.logo}>
            Scan<em>dy</em>
          </div>
          <span className={styles.adminTag}>Admin Panel</span>
        </div>

        {/* Navigation Menu */}
        <nav className={styles.navMenu}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                className={`${styles.navButton} ${isActive ? styles.active : ""}`}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className={styles.sidebarFooter}>
          <button 
            className={styles.backButton}
            onClick={() => navigate("/home")}
          >
            <ArrowLeft size={18} />
            <span>Back to App</span>
          </button>
          
          <button 
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
