import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    userRole: { type: String, required: true },
    otherRole: { type: String, default: "" },
    foundWhatLookingFor: { type: String, required: true },
    whatLookingFor: { type: String, default: "" },
    improvementSuggestions: { type: String, default: "" },
    reachSource: { type: String, required: true },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", FeedbackSchema);
export default Feedback;
