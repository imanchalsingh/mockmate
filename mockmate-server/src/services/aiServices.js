export const askInterview = async (message) => {
  try {
    console.log("Calling Ollama...");

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3",
        prompt: `You are a technical interviewer. Ask interview questions and respond professionally.

User: ${message}`,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error("Ollama request failed");
    }

    const data = await response.json();

    console.log("Ollama replied ✅");

    return data.response || "No response from AI";

  } catch (error) {
    console.error("Ollama ERROR:", error);
    throw error;
  }
};