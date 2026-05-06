import { useLocation } from "react-router-dom";
import QrCard from "../components/QrGreeting";

export default function GreetingPage() {

  const { state } = useLocation();

  if (!state) {
    return <h2>No greeting data found.</h2>;
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