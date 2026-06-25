import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import styles from "./AdminLayout.module.css";

export default function AdminLayout() {
  return (
    <div className={styles.adminContainer}>
      <AdminSidebar />
      <main className={styles.adminMain}>
        <div className={styles.contentWrapper}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}


