import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import chatbotRoutes from "./routes/chatbot-route.js";
import emailRoutes from "./routes/email-route.js";
import feedbackRoutes from "./routes/feedback-route.js";

dotenv.config();

const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors({ origin: "*" }));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
});

app.use("/api/chat", limiter);
app.use("/api/chat", chatbotRoutes);
app.use("/api/contact", emailRoutes);
app.use("/api/feedback", feedbackRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {});
