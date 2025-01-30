const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
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

module.exports = mongoose.model("Feedback", feedbackSchema);
