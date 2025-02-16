const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    professionalRole: { type: String, required: true },
    otherRole: {
      type: String,
      required: function () {
        return this.professionalRole === "other";
      },
      default: "",
    },
    organization: { type: String, default: "" },
    candidateProfileRating: { type: String, required: true },
    candidateDesiredType: {
      type: String,
      required: function () {
        return ["average", "poor"].includes(this.candidateProfileRating);
      },
      default: "",
    },
    culturalFit: {
      type: String,
      required: function () {
        return ["excellent", "good"].includes(this.candidateProfileRating);
      },
    },
    likedProject: {
      type: String,
      required: function () {
        return ["excellent", "good"].includes(this.candidateProfileRating);
      },
    },
    improvableProject: {
      type: String,
      required: function () {
        return ["excellent", "good"].includes(this.candidateProfileRating);
      },
    },
    improvementDetails: {
      type: String,
      required: function () {
        return ["excellent", "good"].includes(this.candidateProfileRating);
      },
    },
    additionalMaterials: { type: String, default: "" },
    userName: { type: String, default: "" },
    userEmail: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
