import express from "express";
const router = express.Router();

router.post("/ask", async (req, res) => {
  const { message } = req.body;

  // fake AI response
  const reply = `You said: "${message}". Tell me more about your experience.`;

  res.json({
    reply,
  });
});

export default router;