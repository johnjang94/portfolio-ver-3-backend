const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
});

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use("/api/contact", limiter);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

transporter.verify(function (error, success) {
  if (success) {
    console.log("SMTP connection verified successfully");
  }
  if (error) {
    console.log("Transporter verification error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

async function testEmail() {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Email",
      text: "If you receive this email, your email configuration is working correctly!",
    });
    console.log("Message sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

testEmail();

const validateInput = (req, res, next) => {
  const { name, email, topic, message } = req.body;

  if (!name || !email || !topic || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  next();
};

app.post("/api/contact", validateInput, async (req, res) => {
  const { name, email, topic, message } = req.body;

  try {
    console.log("Attempting to send email with config:", {
      user: process.env.EMAIL_USER,
      passwordLength: process.env.EMAIL_APP_PASSWORD?.length,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `${topic}`,
      html: `
        <p>${name} has sent me a message via my UX Design portfolio.</p>
        <p><strong>Message:</strong>${message}</p>
      `,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Inquiry Received !",
      html: `
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to me regarding "${topic}".</p>
        <p>This email is to confirm the receipt of your message and I will get back to you as soon as possible.</p>
        <p>Please note that this is an automated response. Do not reply to this email.</p>
        <br>
        <p>Best regards,</p>
        <p>John Jang</p>
      `,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Detailed error:", {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack,
    });

    res.status(500).json({
      error: "Failed to send email",
      details: error.message,
    });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
