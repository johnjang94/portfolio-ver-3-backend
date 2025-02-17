const { transporter } = require("../utils/transporter");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

exports.sendEmail = async (req, res) => {
  console.log("Received request body:", req.body);
  console.log("Received file:", req.file);

  if (
    !req.body.name ||
    !req.body.email ||
    !req.body.Inquiry ||
    !req.body.Message
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const {
      name,
      email,
      Occupation,
      Other,
      SelfEmployed,
      Organization,
      Inquiry,
      Message,
    } = req.body;

    const imagePath = path.join(__dirname, "../logo-512.png");
    const base64Image = fs.readFileSync(imagePath).toString("base64");
    const imageSrc = `data:image/png;base64,${base64Image}`;

    let occupationInfo = Occupation;
    if (Occupation.toLowerCase() === "other") {
      occupationInfo = Other;
      if (Other && Other.toLowerCase() === "freelancer" && SelfEmployed) {
        occupationInfo += ` (Self-employed: ${SelfEmployed})`;
      }
    }

    const organizationInfo = Organization;

    const visitorEmailHtml = `
      <div style="font-family: Arial; padding: 20px; background: #f4f4f4; border-radius: 10px;">
        <div style="text-align: center;">
          <img src="${imageSrc}" alt="Logo" width="30" height="30" />
        </div>
        <div style="width: 100%; max-width: 32rem; margin: 0 auto; margin-top: 1.5rem;">
          <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Hi, ${name}!</h1>
          <p style="font-size: 1.125rem; margin-bottom: 1rem;">Thank you for reaching out!</p>
          <p style="font-size: 1.125rem; margin-bottom: 1.5rem;">
            This email confirms the receipt of your inquiry.
          </p>
          <div style="margin-bottom: 1.5rem;">
            <p style="font-size: 1.125rem; font-weight: bold;">Inquiry:</p>
            <p style="font-size: 1.125rem;">${Inquiry}</p>
          </div>
          <div style="margin-bottom: 1.5rem;">
            <p style="font-size: 1.125rem; font-weight: bold;">Message:</p>
            <div style="background-color: white; padding: 1.25rem; border-radius: 1rem;">
              ${Message}
            </div>
          </div>
          <div style="margin-bottom: 1.5rem;">
            <p style="font-size: 1.125rem; font-weight: bold;">Occupation:</p>
            <p style="font-size: 1.125rem;">${occupationInfo}</p>
          </div>
          <div style="margin-bottom: 1.5rem;">
            <p style="font-size: 1.125rem; font-weight: bold;">Organization:</p>
            <p style="font-size: 1.125rem;">${organizationInfo}</p>
          </div>
          <p style="font-size: 1rem; margin-bottom: 0.5rem;">
            I will get back to you within 1-2 business days.
          </p>
          <p style="font-size: 1rem; font-weight: 500; margin-bottom: 0.5rem;">Best regards,</p>
          <p>John</p>
        </div>
      </div>
    `;

    let attachmentOption = [];
    if (req.file) {
      attachmentOption.push({
        filename: req.file.originalname,
        content: req.file.buffer,
        contentType: req.file.mimetype,
      });
    }

    await transporter.sendMail({
      from: `"Customer Inquiry" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: Inquiry,
      html: `
        <div>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Occupation:</strong> ${occupationInfo}</p>
          <p><strong>Organization:</strong> ${organizationInfo}</p>
          <p><strong>Inquiry:</strong> ${Inquiry}</p>
          <p><strong>Message:</strong></p>
          <div>${Message}</div>
        </div>
      `,
      attachments: attachmentOption,
    });

    await transporter.sendMail({
      from: `"I have received your inquiry!" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank you for reaching out!",
      html: visitorEmailHtml,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
};
