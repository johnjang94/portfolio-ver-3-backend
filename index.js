const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cron = require("node-cron");
const fetch = require("node-fetch");
require("dotenv").config();

const chatbotRoutes = require("./routes/chatbot-route");
const emailRoutes = require("./routes/email-route");
const feedbackRoutes = require("./routes/feedback-route");

const app = express();

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/chat", rateLimit({ windowMs: 60 * 60 * 1000, max: 50 }));
app.use("/api/chat", chatbotRoutes);
app.use("/api/contact", emailRoutes);
app.use("/api/feedback", feedbackRoutes);

app.get("/api/health-check", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

const BACKEND_URL =
  process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
const lastActivity = { timestamp: Date.now() };

app.post("/api/chat", (req, res, next) => {
  lastActivity.timestamp = Date.now();
  next();
});

cron.schedule("*/5 * * * *", async () => {
  try {
    await fetch(`${BACKEND_URL}/api/health-check`);

    if (Date.now() - lastActivity.timestamp < 12 * 60 * 60 * 1000) {
      await fetch(`${BACKEND_URL}/api/chat`, { method: "HEAD" });
    }

    await fetch(`${BACKEND_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "warmup@example.com",
        message: "warm-up",
        warmUp: true,
      }),
    });
  } catch (error) {}
});

app.use((err, req, res, next) =>
  res.status(500).json({ error: "Something went wrong!" })
);
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
