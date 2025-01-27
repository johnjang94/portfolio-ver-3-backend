import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter verification error:", error);
  } else {
    console.log("SMTP connection verified successfully");

    transporter
      .sendMail({
        from: `"Automatic Email Configuration Test" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: "Do Not Reply",
        text: "This is an automated test email sent during deployment. If you receive this message, it means that you have configured properly.",
      })
      .then(() => {
        console.log("Test email sent successfully");
      })
      .catch((err) => {
        console.error("Error sending auto-test email:", err);
      });
  }
});

export default transporter;
