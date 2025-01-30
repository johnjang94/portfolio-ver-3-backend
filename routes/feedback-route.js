const express = require("express");
const Feedback = require("../models/feedback");
const router = express.Router();

const submitFeedback = async (req, res) => {
  try {
    const newFeedback = new Feedback(req.body);
    await newFeedback.save();
    res.status(201).json({ message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
};

router.post("/", submitFeedback);

module.exports = router;
