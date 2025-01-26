const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");

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
  const { name, email, inquiry, message } = req.body;

  if (!name || !email || !inquiry || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  next();
};

app.post("/api/contact", validateInput, async (req, res) => {
  const { email, name, inquiry, message } = req.body;

  const imagePath = path.join(__dirname, "logo-512.png");
  const base64Image = fs.readFileSync(imagePath).toString("base64");
  const imageSrc = `data:image/png;base64,${base64Image}`;

  const visitorEmailHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4; border-radius: 10px; max-width: 600px; margin: auto;">
      <div style="text-align: center;">
        <img src="${imageSrc}" alt="Logo" width="30" height="30" />
      </div>
      <h2>Hi, ${name}!</h2>
      <p>Thank you for reaching out to me!</p>
      <p>This is to confirm that I have received your inquiry regarding <strong>${inquiry}</strong>.</p>
      <p>I will get back to you within 1-2 business days.</p>
      <p>Best regards,</p>
      <p>John</p>
    </div>
  `;

  try {
    const yourEmail = await transporter.sendMail({
      from: `"Customer Inquiry" <${process.env.EMAIL_USER}>`,
      to: `"John Jang" <${process.env.EMAIL_USER}>`,
      subject: `${inquiry}`,
      html: `<p>${message}</p>`,
    });
    console.log("Admin email sent successfully:", yourEmail.messageId);

    const visitorEmail = await transporter.sendMail({
      from: `"No-Reply: Confirmation from John Jang" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank you for reaching out to me!",
      html: visitorEmailHtml,
    });
    console.log("Visitor email sent successfully:", visitorEmail.messageId);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
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
