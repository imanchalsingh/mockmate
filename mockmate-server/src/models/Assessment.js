import mongoose from "mongoose";

const AssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    topic: String,
    input: String,
    report: Object
  },
  { timestamps: true }
);

export default mongoose.model("Assessment", AssessmentSchema);