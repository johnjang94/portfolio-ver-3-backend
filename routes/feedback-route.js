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

    if (professionalRole === "other" && !otherRole) {
      return res.status(400).json({ error: "Other role details required" });
    }

    if (
      ["average", "poor"].includes(candidateProfileRating) &&
      !candidateDesiredType
    ) {
      return res
        .status(400)
        .json({ error: "Desired type explanation required" });
    }

    if (["excellent", "good"].includes(candidateProfileRating)) {
      if (
        !culturalFit ||
        !likedProject ||
        !improvableProject ||
        !improvementDetails
      ) {
        return res
          .status(400)
          .json({ error: "All feedback fields are required" });
      }
    }

    const feedbackData = {
      professionalRole,
      organization,
      candidateProfileRating,
      additionalMaterials,
      userName,
      userEmail,
    };

    if (professionalRole === "other") {
      feedbackData.otherRole = otherRole;
    }

    if (["average", "poor"].includes(candidateProfileRating)) {
      feedbackData.candidateDesiredType = candidateDesiredType;
    } else {
      feedbackData.culturalFit = culturalFit;
      feedbackData.likedProject = likedProject;
      feedbackData.improvableProject = improvableProject;
      feedbackData.improvementDetails = improvementDetails;
    }

    const newFeedback = new Feedback(feedbackData);
    await newFeedback.save();

    const ownerEmailText = `
Portfolio Feedback Submission

🏢 Professional Role: ${professionalRole} ${otherRole ? `(${otherRole})` : ""}
🏢 Organization: ${organization || "N/A"}
⭐ Portfolio Rating: ${candidateProfileRating}
${
  ["average", "poor"].includes(candidateProfileRating)
    ? `🔍 Candidate Desired Type: ${candidateDesiredType}\n`
    : ""
}
${
  ["excellent", "good"].includes(candidateProfileRating)
    ? `
🎯 Cultural Fit: ${culturalFit}
❤️ Liked Project: ${likedProject}
🔧 Improvable Project: ${improvableProject}
📝 Improvement Details: ${improvementDetails}
`
    : ""
}
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

    if (userEmail) {
      let confirmationEmailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <p>Thank you for visiting my website and providing feedback on my portfolio.</p>
      `;

      if (["excellent", "good"].includes(candidateProfileRating)) {
        confirmationEmailHtml += `
        <p>I'm glad to see that my case studies provided you with the information you needed. I hope we can connect again soon.</p>`;
      } else {
        confirmationEmailHtml += `
        <p>Thank you for your honest opinion. I will definitely consider making improvements based on your feedback${
          candidateDesiredType ? " regarding " + candidateDesiredType : ""
        }.</p>`;
      }

      confirmationEmailHtml += userName
        ? `<p>Thank you again, ${userName}, for taking the time to complete the survey.<br>Yours sincerely,<br>John</p>`
        : `<p>Thank you again for your feedback.<br>Yours sincerely,<br>John</p>`;

      confirmationEmailHtml += `</div>`;

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
