import { ImageResponse } from "@vercel/og";
import { createClient } from "@supabase/supabase-js";

export const config = { runtime: "edge" };

export default async function handler(req) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  let recipientName = "You";
  let occasion = "Special Occasion";
  let message = "A special video surprise awaits you";

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
    const { data } = await supabase
      .from("greetings")
      .select("occassion, receiptant_name, message")
      .eq("id", id)
      .single();

    if (data) {
      recipientName = data.receiptant_name || "You";
      occasion = data.occassion || "Special Occasion";
      message = data.message || message;
    }
  } catch (e) {}

  const shortMsg =
    message.length > 90 ? message.substring(0, 90) + "..." : message;

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        background: "linear-gradient(135deg, #07091a 0%, #111538 50%, #0c1025 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: "28px", color: "#7c6ef8", fontWeight: 900, letterSpacing: "-0.5px", marginBottom: "36px" }}>
        Gretora
      </div>
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "28px",
          padding: "52px 72px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: "860px",
          width: "860px",
        }}
      >
        <div style={{ fontSize: "14px", color: "#7c6ef8", fontWeight: 700, letterSpacing: "4px", marginBottom: "20px", display: "flex" }}>
          {occasion.toUpperCase()} GREETING CARD
        </div>
        <div style={{ fontSize: "58px", fontWeight: 900, color: "#fff", marginBottom: "20px", textAlign: "center", display: "flex", letterSpacing: "-2px" }}>
          For {recipientName} 🎁
        </div>
        <div style={{ display: "flex", width: "100px", height: "2px", background: "linear-gradient(90deg, transparent, #7c6ef8, transparent)", marginBottom: "24px" }} />
        <div style={{ fontSize: "20px", color: "rgba(255,255,255,0.55)", textAlign: "center", display: "flex", lineHeight: "1.6" }}>
          "{shortMsg}"
        </div>
      </div>
      <div style={{ marginTop: "32px", fontSize: "16px", color: "rgba(255,255,255,0.35)", display: "flex" }}>
        Scan the QR code to reveal your video surprise ✨
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}