import fetch from "node-fetch";

export const askInterview = async (message) => {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3",
        prompt: `
You are a professional technical interviewer.
Ask clear and relevant interview questions.
If user answers, respond with feedback and ask next question.

User: ${message}
        `,
        stream: false,
      }),
    });

    const data = await response.json();

    return data.response;

  } catch (error) {
    console.error("Ollama error:", error);
    throw new Error("Local AI failed");
  }
};