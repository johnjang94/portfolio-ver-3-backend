import express from "express";
import Feedback from "../models/feedback.js";
import transporter from "../utils/transporter.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      userRole,
      otherRole,
      foundWhatLookingFor,
      whatLookingFor,
      improvementSuggestions,
      reachSource,
    } = req.body;

    if (!userRole || !foundWhatLookingFor || !reachSource) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newFeedback = new Feedback({
      userRole,
      otherRole: userRole === "other" ? otherRole : "",
      foundWhatLookingFor,
      whatLookingFor,
      improvementSuggestions,
      reachSource,
    });

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

    res.status(201).json({ message: "Feedback submitted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
