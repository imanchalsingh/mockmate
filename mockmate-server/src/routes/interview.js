import express from "express";
const router = express.Router();
import { askInterview } from "../services/aiServices.js";


router.post("/ask", async (req, res) => {
  try {
    console.log("Request received:", req.body);

    const { message } = req.body;

    const reply = await askInterview(message);
    res.json({ reply });

  } catch (error) {
    console.error("FULL ERROR 👉", error);
    res.status(500).json({
      error: error.message || "Server error",
    });
  }
});

export default router;