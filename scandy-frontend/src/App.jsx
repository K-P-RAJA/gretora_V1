import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "./routes/ProtectedRoutes";

import HomePage from "./pages/HomePage";
import GreetingPage from "./pages/GreetingPage";
import ViewGreetingPage from "./pages/ViewGreetingPage";

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

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

        {/* PUBLIC PAGE */}
        <Route
          path="/view/:id"
          element={<ViewGreetingPage />}
        />

        {/* ALWAYS LAST */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;