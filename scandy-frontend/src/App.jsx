// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "./routes/ProtectedRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
       <Route path="/" element={<LandingPage />} />
       <Route path="*" element={<Navigate to="/" replace />} />
       <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
        <DashboardPage />
        </ProtectedRoute>
      }/>
       
      </Routes>
    </BrowserRouter>
  );
}

export default App;