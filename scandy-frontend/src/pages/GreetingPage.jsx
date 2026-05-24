import { useLocation, useNavigate } from "react-router-dom";
import QrCard from "../components/QrGreeting";

export default function GreetingPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
        <div style={{
          minHeight: "100vh",
          background: "#09090b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Content */}
          <div style={{
            position: "relative", zIndex: 2,
            textAlign: "center", padding: "40px",
          }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🎁</div>

            <h2 style={{
              color: "#ffffff", fontSize: 28, fontWeight: 800,
              letterSpacing: "-0.5px", marginBottom: 12,
            }}>
              Greeting not found
            </h2>

            <p style={{
              color: "#a1a1aa", fontSize: 15,
              lineHeight: 1.7, marginBottom: 32, maxWidth: 360,
            }}>
              This greeting may have expired, been removed, or the link is invalid.
            </p>



          <button
            onClick={() => navigate("/")}
            style={{
              background: "linear-gradient(135deg, #6c47ff, #4f2fe8)",
              color: "white", border: "none",
              padding: "13px 32px", borderRadius: 14,
              fontSize: 15, fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 18px rgba(108,71,255,0.35)",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Go to Scandy →
          </button>
        </div>
      </div>
    );
  }

  return (
    <QrCard
      qrUrl={state.qrUrl}
      recipientName={state.recipientName}
      occasion={state.occasion}
      message={state.message}
    />
  );
}