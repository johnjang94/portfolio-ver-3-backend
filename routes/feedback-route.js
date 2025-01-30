const express = require("express");
const Feedback = require("../models/feedback");
const transporter = require("../utils/transporter");
const router = express.Router();

const submitFeedback = async (req, res) => {
  try {
    const {
      userRole,
      otherRole,
      foundWhatLookingFor,
      whatLookingFor,
      improvementSuggestions,
      reachSource,
    } = req.body;

    const newFeedback = new Feedback(req.body);
    await newFeedback.save();

    await transporter.sendMail({
      from: `"Portfolio Feedback" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "New Feedback Received!",
      text: `
        🏢 User Role: ${userRole} ${otherRole ? `(${otherRole})` : ""}
        ✅ Found: ${foundWhatLookingFor}
        🔍 Looking for: ${whatLookingFor || "N/A"}
        📢 Suggestions: ${improvementSuggestions || "N/A"}
        🌍 Source: ${reachSource}
      `,
    });

    res
      .status(201)
      .json({ message: "Feedback submitted successfully & email sent!" });
  } catch (error) {
    console.error("Error saving feedback or sending email:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

router.post("/", submitFeedback);

module.exports = router;
