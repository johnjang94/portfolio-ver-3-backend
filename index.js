const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
require("dotenv").config();

const chatbotRoutes = require("./routes/chatbot-route");
const emailRoutes = require("./routes/email-route");
const feedbackRoutes = require("./routes/feedback-route");

const app = express();
app.set("trust proxy", 1);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors({ origin: "*" }));
app.use(express.json());

(async () => {
  const { default: rateLimit } = await import("express-rate-limit");
  const chatRateLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 50 });
  app.use("/api/chat", chatRateLimiter);

  app.use("/api/chat", chatbotRoutes);
  app.use("/api/contact", emailRoutes);
  app.use("/api/feedback", feedbackRoutes);

  app.get("/api/health-check", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date() });
  });

  const BACKEND_URL =
    process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;

  cron.schedule("*/5 * * * *", async () => {
    console.log(
      "[CRON] Starting keep-alive cycle at",
      new Date().toISOString()
    );
    try {
      let healthResponse = await fetch(`${BACKEND_URL}/api/health-check`);
      console.log(
        "[CRON] Health-check response status:",
        healthResponse.status
      );

      let chatResponse = await fetch(`${BACKEND_URL}/api/chat`);
      console.log("[CRON] Chat ping response status:", chatResponse.status);

      let emailResponse = await fetch(`${BACKEND_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "warmup@example.com",
          message: "warm-up",
          warmUp: true,
        }),
      });
      console.log("[CRON] Email ping response status:", emailResponse.status);
    } catch (error) {
      console.error("[CRON] Error during keep-alive cycle:", error);
    }
  });

  app.use((err, req, res, next) =>
    res.status(500).json({ error: "Something went wrong!" })
  );
  app.use((req, res) => res.status(404).json({ error: "Not Found" }));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})();
