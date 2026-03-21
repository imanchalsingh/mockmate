const SYSTEM_PROMPT = `
You are MockMate, an intelligent AI interviewer.

Your job:
- Talk naturally like a real human interviewer.
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

const sessions = new Map();

export const askInterview = async (userId, sessionId, userMessage) => {

  const key = `${userId}-${sessionId}`;

  if (!sessions.has(key)) {
    sessions.set(key, [
      { role: "system", content: SYSTEM_PROMPT }
    ]);
  }

  const conversationHistory = sessions.get(key);

  conversationHistory.push({
    role: "user",
    content: userMessage
  });

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "phi3:mini",
      stream: false,
      messages: conversationHistory
    })
  });

  const data = await response.json();

  const aiReply =
    data.message?.content?.trim() ||
    "Could you elaborate on that?";

  conversationHistory.push({
    role: "assistant",
    content: aiReply
  });

  return aiReply;
};