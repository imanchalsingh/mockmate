import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  messages: [
    {
      role: String,
      content: String,
    }
  ],
}, { timestamps: true });

export default mongoose.model("Interview", interviewSchema);