// ---- Interview Session Memory ----
import callAI from "./callAi.js"

const SYSTEM_PROMPT = `
You are MockMate, an intelligent AI interviewer.

Talk naturally like a real interviewer.
Keep replies short (2–4 sentences).
Ask one follow-up question when appropriate.
`;

const sessions = new Map();

export async function askInterview(userId, sessionId, userMessage) {
  const key = `${userId}-${sessionId}`;

  if (!sessions.has(key)) {
    sessions.set(key, [
      { role: "system", content: SYSTEM_PROMPT }
    ]);
  }

  const history = sessions.get(key);

  history.push({
    role: "user",
    content: userMessage
  });

  const reply = await callAI(history);

  history.push({
    role: "assistant",
    content: reply
  });

  // prevent memory overflow
  if (history.length > 20) {
    history.splice(1, 2);
  }

  return reply;
}

export async function generateAssessmentAI(topic, input) {

  const prompt = `
Evaluate this candidate response.

Topic: ${topic}

Response:
${input}

Return ONLY JSON:
{
  "score": number,
  "strengths": [],
  "weaknesses": [],
  "improvements": [],
  "summary": ""
}
`;

  const aiText = await callAI([
    { role: "user", content: prompt }
  ]);

  let report;

  try {
    report = JSON.parse(aiText);
  } catch {
    report = {
      score: 60,
      strengths: [],
      weaknesses: [],
      improvements: [],
      summary: aiText
    };
  }

  return report;
}