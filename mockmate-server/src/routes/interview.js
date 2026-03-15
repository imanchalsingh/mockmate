import express from "express";
const router = express.Router();

import { askInterview } from "../services/aiServices.js";
import { protect } from "../middleware/auth.middleware.js";
import Interview from "../models/Interview.model.js";

router.post("/ask", protect, async (req, res) => {
  try {
    console.log("Request received:", req.body);

    const { message } = req.body;

    const reply = await askInterview(message);

    // Save conversation
    await Interview.findOneAndUpdate(
      { user: req.user.id },
      {
        $push: {
          messages: [
            { role: "user", content: message },
            { role: "assistant", content: reply },
          ],
        },
      },
      { upsert: true }
    );

    res.json({ reply });

  } catch (error) {
    console.error("FULL ERROR 👉", error);

    res.status(500).json({
      error: error.message || "Server error",
    });
  }
});

// get histroy of convo
router.get("/history", protect, async (req, res) => {
  try {
    const interview = await Interview.findOne({
      user: req.user.id,
    });

    if (!interview) {
      return res.json({ messages: [] });
    }

    res.json({
      messages: interview.messages,
    });

  } catch (error) {
    console.error("FETCH HISTORY ERROR 👉", error);
    res.status(500).json({
      error: "Failed to fetch history",
    });
  }
});


export default router;