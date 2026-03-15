import express from "express";
const router = express.Router();

import { askInterview } from "../services/aiServices.js";
import { protect } from "../middleware/auth.middleware.js";
import Interview from "../models/Interview.model.js";

router.post("/new", protect, async (req, res) => {
  try {
    const chat = await Interview.create({
      user: req.user.id,
      title: "Mock Interview",
      messages: [],
    });

    res.json(chat);
  } catch (error) {
    console.error("CREATE CHAT ERROR 👉", error);
    res.status(500).json({ error: "Failed to create chat" });
  }
});

router.get("/sessions", protect, async (req, res) => {
  try {
    const sessions = await Interview.find({
      user: req.user.id,
    })
      .select("_id title createdAt")
      .sort({ createdAt: -1 });

    res.json({ sessions });
  } catch (error) {
    console.error("SESSIONS ERROR 👉", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

router.get("/history/:chatId", protect, async (req, res) => {
  try {
    const chat = await Interview.findOne({
      _id: req.params.chatId,
      user: req.user.id,
    });

    if (!chat) {
      return res.json({ messages: [] });
    }

    res.json({
      messages: chat.messages,
    });
  } catch (error) {
    console.error("HISTORY ERROR 👉", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

router.post("/ask", protect, async (req, res) => {
  try {
    const { message, chatId } = req.body;

    if (!chatId)
      return res.status(400).json({ error: "chatId required" });

    console.log("Message:", message);

    const reply = await askInterview(message);

    await Interview.findOneAndUpdate(
      {
        _id: chatId,
        user: req.user.id,
      },
      {
        $push: {
          messages: [
            { role: "user", content: message },
            { role: "assistant", content: reply },
          ],
        },
      }
    );

    res.json({ reply });
  } catch (error) {
    console.error("ASK ERROR 👉", error);
    res.status(500).json({
      error: error.message || "Server error",
    });
  }
});

router.delete("/sessions/:chatId", protect, async (req, res) => {
  try {
    await Interview.findOneAndDelete({
      _id: req.params.chatId,
      user: req.user.id,
    });

    res.json({ message: "Chat deleted" });
  } catch (error) {
    console.error("DELETE ERROR 👉", error);
    res.status(500).json({ error: "Delete failed" });
  }
});

// Rename chat session
router.patch("/sessions/:chatId", protect, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        error: "Title is required",
      });
    }

    // find chat belonging to logged-in user
    const chat = await Interview.findOneAndUpdate(
      {
        _id: chatId,
        user: req.user.id,
      },
      {
        title: title.trim(),
      },
      {
        new: true,
      }
    );

    if (!chat) {
      return res.status(404).json({
        error: "Chat session not found",
      });
    }

    res.json({
      message: "Chat renamed successfully",
      chat,
    });

  } catch (error) {
    console.error("RENAME CHAT ERROR 👉", error);
    res.status(500).json({
      error: "Failed to rename chat",
    });
  }
});
export default router;