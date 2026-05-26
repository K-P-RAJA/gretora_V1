import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AlertProvider } from "./context/AlertContext";

import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "./routes/ProtectedRoutes";
import PublicRoute from "./routes/PublicRoute";

import HomePage from "./pages/HomePage";
import GreetingPage from "./pages/GreetingPage";
import ViewGreetingPage from "./pages/ViewGreetingPage";
import MyGreetingsPage from "./pages/MyGreetingsPage";
import ProfilePage from "./pages/ProfilePage";

import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReports from "./pages/admin/AdminReports";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminGreetings from "./pages/admin/AdminGreetings";
import AdminSupport from "./pages/admin/AdminSupport";
import SuspendedPage from "./pages/SuspendedPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function App() {

  return (
    <AlertProvider>
      <BrowserRouter>

      <Routes>

        {/* PUBLIC-ONLY — redirect to /home if already logged in */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* PROTECTED — redirect to /login if not logged in */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/greeting/:id"
          element={
            <ProtectedRoute>
              <GreetingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mygreetings"
          element={
            <ProtectedRoute>
              <MyGreetingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* FULLY PUBLIC — QR scan target, no auth needed */}
        <Route
          path="/g/:id"
          element={<ViewGreetingPage />}
        />

        {/* SUSPENDED SCREEN */}
        <Route path="/suspended" element={<SuspendedPage />} />

        {/* RESET PASSWORD */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ADMIN PANEL */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="greetings" element={<AdminGreetings />} />
          <Route path="support" element={<AdminSupport />} />
        </Route>

        {/* CATCH-ALL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

      </BrowserRouter>
    </AlertProvider>
  );
}

export default App;