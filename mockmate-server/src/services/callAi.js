// src/services/ai.service.js

const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL = "tinyllama";

/*
  Single AI caller
  Every feature uses THIS only
*/
async function callAI(messages) {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      messages
    })
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Ollama Error:", text);
    throw new Error("AI request failed");
  }

  const data = await res.json();

  return (
    data?.message?.content?.trim() ||
    data?.response ||
    ""
  );
}

export default callAI;