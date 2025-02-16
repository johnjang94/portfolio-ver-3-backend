const express = require("express");
const Feedback = require("../models/feedback");
const { transporter } = require("../utils/transporter");
const router = express.Router();

const submitFeedback = async (req, res) => {
  try {
    const {
      professionalRole,
      otherRole,
      organization,
      candidateProfileRating,
      candidateDesiredType,
      culturalFit,
      likedProject,
      improvableProject,
      improvementDetails,
      additionalMaterials,
      userName,
      userEmail,
    } = req.body;

    const newFeedback = new Feedback(req.body);
    await newFeedback.save();

    const ownerEmailText = `
Portfolio Feedback Submission

🏢 Professional Role: ${professionalRole} ${otherRole ? `(${otherRole})` : ""}
🏢 Organization: ${organization || "N/A"}
⭐ Portfolio Rating: ${candidateProfileRating}
${
  (candidateProfileRating === "average" || candidateProfileRating === "poor") &&
  candidateDesiredType
    ? `🔍 Candidate Desired Type: ${candidateDesiredType}\n`
    : ""
}
${culturalFit ? `🎯 Cultural Fit: ${culturalFit}\n` : ""}
${likedProject ? `❤️ Liked Project: ${likedProject}\n` : ""}
${improvableProject ? `🔧 Improvable Project: ${improvableProject}\n` : ""}
${improvementDetails ? `📝 Improvement Details: ${improvementDetails}\n` : ""}
${
  additionalMaterials ? `📚 Additional Materials: ${additionalMaterials}\n` : ""
}
${userName ? `👤 User Name: ${userName}\n` : ""}
${userEmail ? `📧 User Email: ${userEmail}\n` : ""}
    `;

    await transporter.sendMail({
      from: `"Portfolio Feedback" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "New Portfolio Feedback Received!",
      text: ownerEmailText,
    });

    let confirmationEmailHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <p>
        Thank you for visiting my website and providing feedback on my portfolio.
      </p>
    `;

    if (
      candidateProfileRating === "excellent" ||
      candidateProfileRating === "good"
    ) {
      confirmationEmailHtml += `
      <p>
        I'm glad to see that my case studies provided you with the information you needed. I hope we can connect again soon.
      </p>`;
    } else if (
      candidateProfileRating === "average" ||
      candidateProfileRating === "poor"
    ) {
      confirmationEmailHtml += `
      <p>
        Thank you for your honest opinion. I will definitely consider making improvements based on your feedback${
          candidateDesiredType ? " regarding " + candidateDesiredType : ""
        }.
      </p>`;
    } else {
      confirmationEmailHtml += `
      <p>
        I appreciate your feedback and wish you all the best.
      </p>`;
    }

    confirmationEmailHtml += userName
      ? `
      <p>
        Thank you again, ${userName}, for taking the time to complete the survey.<br>
        Yours sincerely,<br>
        John
      </p>
      `
      : `
      <p>
        Thank you again for your feedback.<br>
        Yours sincerely,<br>
        John
      </p>
      `;

    confirmationEmailHtml += `</div>`;

    // 이름과 이메일이 입력된 경우에만 확인 이메일 전송
    if (userEmail) {
      await transporter.sendMail({
        from: `"Portfolio Feedback" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "Thank you for your feedback!",
        html: confirmationEmailHtml,
      });
    }

    res.status(201).json({
      message: "Feedback submitted successfully & emails sent!",
    });
  } catch (error) {
    console.error("Error saving feedback or sending emails:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

router.post("/", submitFeedback);

module.exports = router;
