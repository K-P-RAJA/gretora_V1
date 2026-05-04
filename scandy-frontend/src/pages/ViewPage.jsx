import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getGreeting } from "../api/greetingApi";

function ViewPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    getGreeting(id)
      .then((res) => setData(res))
      .catch(() => alert("Failed to load greeting"));
  }, [id]);

  if (!data) return <h2>Loading...</h2>;

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>{data.title}</h1>
      <p>{data.message}</p>

      <video width="400" controls autoPlay>
        <source src={data.videoUrl} type="video/mp4" />
      </video>
    </div>
  );
}

export default ViewPage;