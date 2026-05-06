import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ViewGreetingPage() {

  const { id } = useParams();

  const [greeting, setGreeting] = useState(null);

  useEffect(() => {

    async function fetchGreeting() {

      try {

        const res = await fetch(
          `https://localhost:7246/g/${id}`
        );

        const data = await res.json();

        setGreeting(data);

      } catch (err) {

        console.error(err);

      }
    }

    fetchGreeting();

  }, [id]);

  if (!greeting) {
    return <h2>Loading...</h2>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          background: "white",
          borderRadius: "24px",
          padding: "30px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        }}
      >
        <h1>{greeting.title}</h1>

        <p
          style={{
            marginTop: "12px",
            color: "#666",
            lineHeight: 1.7,
          }}
        >
          {greeting.message}
        </p>

        <video
          controls
          autoPlay
          style={{
            width: "100%",
            borderRadius: "20px",
            marginTop: "24px",
          }}
        >
          <source
            src={greeting.videoUrl}
            type="video/mp4"
          />
        </video>

      </div>
    </div>
  );
}