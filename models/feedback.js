const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    professionalRole: { type: String, required: true },
    otherRole: { type: String, default: "" },
    organization: { type: String, default: "" },
    candidateProfileRating: { type: String, required: true },
    candidateDesiredType: { type: String, default: "" },
    culturalFit: { type: String, required: true },
    likedProject: { type: String, required: true },
    improvableProject: { type: String, required: true },
    improvementDetails: { type: String, required: true },
    additionalMaterials: { type: String, default: "" },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
