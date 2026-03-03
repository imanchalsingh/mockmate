const SYSTEM_PROMPT = `
You are MockMate, an intelligent AI interviewer.

Your job:
- Talk naturally like a real human interviewer.
- Respond ONLY to the user's latest message.
- Do NOT give instructions, lists, or explanations about interviewing.
- Do NOT explain what you will do.
- Just continue the conversation.

Rules:
1. Always reply conversationally (2–4 sentences max).
2. Ask ONE relevant follow-up question when appropriate.
3. Stay focused on interview-style conversation.
4. If user greets → greet back naturally.
5. If user answers → ask next logical interview question.
6. Never output numbered lists or guidelines.
7. Never say "Start with", "Ask about", or give steps.
8. Be friendly, professional, and concise.

You are conducting a live interview, not explaining interviews.
`;
export const askInterview = async (userMessage) => {
  try {
    console.log("Calling Ollama...");

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi3:mini",
        stream: false,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ]
      })
    });

    if (!response.ok) {
      throw new Error("Ollama request failed");
    }

    // ✅ FIRST create data
    const data = await response.json();

    // ✅ THEN use it
    console.log("OLLAMA RAW RESPONSE:", data);

    const aiReply =
      data.message?.content?.trim() || "No response from AI";

    console.log("Ollama replied ✅");
    console.log("AI Reply:", aiReply);

    return aiReply;

  } catch (error) {
    console.error("Ollama ERROR:", error);
    throw error;
  }
};