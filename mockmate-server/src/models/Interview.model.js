import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: String,
    content: String,
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "New Interview",
    },

    messages: [messageSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);