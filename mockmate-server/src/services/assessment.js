const ASSESSMENT_PROMPT = `
You are an expert technical interviewer evaluating a candidate.

Analyze the interview conversation and return STRICT JSON.

Evaluate on:
- Communication
- Technical Knowledge
- Problem Solving
- Confidence
- Clarity

Return JSON only:

{
  "overallScore": number (0-100),
  "communication": number,
  "technicalKnowledge": number,
  "problemSolving": number,
  "confidence": number,
  "clarity": number,
  "strengths": ["point"],
  "weaknesses": ["point"],
  "improvements": ["point"],
  "finalVerdict": "short paragraph"
}
`;

export const generateAssessment = async (conversation) => {

    const messages = [
        { role: "system", content: ASSESSMENT_PROMPT },
        {
            role: "user",
            content: JSON.stringify(conversation)
        }
    ];

    const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "phi3:mini",
            stream: false,
            messages
        })
    });

    const data = await response.json();

    return JSON.parse(data.message.content);
};