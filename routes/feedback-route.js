const express = require("express");
const Feedback = require("../models/feedback");
const transporter = require("../utils/transporter");
const router = express.Router();

const submitFeedback = async (req, res) => {
  try {
    const {
      professionalRole,
      otherRole,
      organization,
      candidateProfileRating,
      candidateDesiredType,
      candidateLackingFeedback,
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
  ["average", "poor"].includes(candidateProfileRating)
    ? `🔍 Candidate Desired Type: ${candidateDesiredType}\n`
    : ""
}
${
  candidateLackingFeedback
    ? `💡 Candidate Lacking Feedback: ${candidateLackingFeedback}\n`
    : ""
}
🎯 Cultural Fit: ${culturalFit}
❤️ Liked Project: ${likedProject}
🔧 Improvable Project: ${improvableProject}
📝 Improvement Details: ${improvementDetails}
📚 Additional Materials: ${additionalMaterials}
👤 User Name: ${userName}
📧 User Email: ${userEmail}
    `;

    await transporter.sendMail({
      from: `"Portfolio Feedback" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "New Portfolio Feedback Received!",
      text: ownerEmailText,
    });

    const confirmationEmailHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <p>
        Thank you for your visit to my website and your feedback on my portfolio, ${userName}.<br>
        I see that you are a ${professionalRole} ${
      otherRole ? `(${otherRole})` : ""
    } at ${organization || "N/A"}.
      </p>
      ${
        candidateProfileRating === "excellent" ||
        candidateProfileRating === "good"
          ? `<p>
              I am glad to see that my case studies have been able to provide you an adequate amount of information. I hope to hear back from you in near future.
            </p>`
          : (candidateProfileRating === "average" ||
              candidateProfileRating === "poor") &&
            candidateLackingFeedback
          ? `<p>
              Thank you for your opinion. I will definitely consider making changes based on your advice.
            </p>
            <p>
              In addition, I appreciate your time and effort to explain your company's culture and how my work might fit to your culture. In order to be better, I will certainly work harder to improve ${improvableProject} in terms of ${improvementDetails} that you have mentioned.
            </p>`
          : `<p>
              I appreciate your visit to my website. I wish you all the best to find the suitable candidate in your journey.
            </p>`
      }
      <p>
        Thank you again, ${userName}, for your time to go through my portfolio. I appreciate your effort to help me and I hope that our paths cross again.<br>
        Yours sincerely,<br>
        John
      </p>
    </div>
  `;

    await transporter.sendMail({
      from: `"Portfolio Feedback" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Thank you for your feedback!",
      html: confirmationEmailHtml,
    });

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
