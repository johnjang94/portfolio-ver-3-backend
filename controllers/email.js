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
        <div style="width: 100%; max-width: 32rem; margin: 0 auto; margin-top: 1.5rem;">
    <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Hi, ${name}!</h1>
    <p style="font-size: 1.125rem; margin-bottom: 1rem;">Thank you for reaching out to me!</p>
    <p style="font-size: 1.125rem; margin-bottom: 1.5rem;">
      This email is to confirm the receipt of your inquiry with the following content:
    </p>
    <div style="display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.5rem;">
      <p style="font-size: 1.125rem;">Inquiry:</p>
      <p style="font-weight: bold;">${inquiry}</p>
    </div>
    <div style="margin-bottom: 1.5rem;">
      <p style="font-size: 1.125rem; margin-bottom: 0.5rem;">Message:</p>
      <p style="background-color: white; padding: 1.25rem; border-radius: 1rem;">${message}</p>
    </div>
    <p style="font-size: 1rem; margin-bottom: 0.5rem;">
      I will get back to you within 1-2 business days.
    </p>
    <p style="font-size: 1rem; font-weight: 500; margin-bottom: 0.5rem;">Best regards,</p>
    <p>John</p>
  </div>
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
