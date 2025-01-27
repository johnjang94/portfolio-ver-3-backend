const transporter = require("../utils/transporter");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

exports.sendEmail = async (req, res) => {
  const { email, name, inquiry, message } = req.body;

  const imagePath = path.join(__dirname, "../logo-512.png");
  const base64Image = fs.readFileSync(imagePath).toString("base64");
  const imageSrc = `data:image/png;base64,${base64Image}`;

  const visitorEmailHtml = `
    <div style="font-family: Arial; padding: 20px; background: #f4f4f4; border-radius: 10px;">
      <div style="text-align: center;">
        <img src="${imageSrc}" alt="Logo" width="30" height="30" />
      </div>
      <h2>Hi, ${name}!</h2>
      <p>Thank you for reaching out to me!</p>
      <p>I will get back to you within 1-2 business days.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Customer Inquiry" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `${inquiry}`,
      html: `<p>${message}</p>`,
    });

    await transporter.sendMail({
      from: `"No-Reply: Confirmation from John Jang" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank you for reaching out to me!",
      html: visitorEmailHtml,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
};
