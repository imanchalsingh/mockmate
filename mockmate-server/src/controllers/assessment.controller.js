import Assessment from "../models/Assessment.js";
import { generateAssessmentAI } from "../services/aiServices.js";

export const createAssessment = async (req, res) => {
  try {
    const { topic, input } = req.body;

    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    if (!input)
      return res.status(400).json({ message: "Input required" });

    // AI evaluation
    const report = await generateAssessmentAI(topic, input);

    const assessment = await Assessment.create({
      userId: req.user.id,
      topic,
      input,
      report
    });

    res.json({
      id: assessment._id
    });

  } catch (err) {
    console.error("ASSESSMENT CREATE ERROR:", err);
    res.status(500).json({ message: "Assessment failed" });
  }
};

export const getAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!assessment)
      return res.status(404).json({ message: "Assessment not found" });

    res.json(assessment);

  } catch (err) {
    console.error("GET ASSESSMENT ERROR:", err);
    res.status(500).json({ message: "Failed to fetch assessment" });
  }
};

export const getHistory = async (req, res) => {
  try {
    const history = await Assessment.find({
      userId: req.user.id
    })
      .sort({ createdAt: -1 })
      .select("_id topic createdAt");

    res.json(history);

  } catch (err) {
    console.error("HISTORY ERROR:", err);
    res.status(500).json({ message: "Failed to fetch history" });
  }
};