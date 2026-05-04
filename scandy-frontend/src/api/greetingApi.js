const BASE_URL = "https://localhost:7246"; // your backend

export const getGreeting = async (greetingId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/greeting/${greetingId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch greeting");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching greeting:", error);
    return null;
  }
};