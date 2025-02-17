const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const multer = require("multer");
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

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use((req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart/form-data")) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use("/api/chat", chatbotRoutes);
app.use("/api/contact", upload.single("attachment"), emailRoutes);
app.use("/api/feedback", feedbackRoutes);

app.get("/api/health-check", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
