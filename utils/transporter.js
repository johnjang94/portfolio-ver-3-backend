const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendDeploymentTestEmail = async () => {
  try {
    await transporter.sendMail({
      from: `"Automatic Email Configuration Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Do Not Reply",
      text: "This is an automated test email sent during deployment.",
    });
    console.log("Deployment test email sent successfully.");
  } catch (error) {
    console.error("Error sending deployment test email:", error);
  }
};

transporter.verify(async (error) => {
  if (!error) {
    console.log("SMTP connection verified successfully.");
    await sendDeploymentTestEmail();
  } else {
    console.error("Transporter verification error:", error);
  }
});

const sendEmail = async ({ email, subject, text, warmUp = false }) => {
  if (warmUp) return { message: "SMTP connection warmed up, email not sent." };
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text,
    });
    return { message: "Email sent successfully." };
  } catch {
    return { error: "Failed to send email." };
  }
};

module.exports = { transporter, sendEmail };
