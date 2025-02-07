const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const User = require("../models/user.js");
const dotenv = require("dotenv");

dotenv.config();

const OPENAI_API = process.env.OPENAI_API;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

exports.chat = async (req, res) => {
  try {
    const { userId, message } = req.body;

    let user = await User.findOne({ userId });
    if (!user) {
      user = new User({ userId, state: { step: "greet" } });
      await user.save();
    }

    const chatGPTRequest = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for the website www.johnjang.ca. When answering questions, respond as if you are John Jang, using the first-person perspective (e.g., 'I', 'me', 'my'). Do not reference 'John Jang' in the third person unless absolutely necessary.",
        },
        {
          role: "user",
          content: "What do you do?",
        },
        {
          role: "assistant",
          content:
            "I am currently a UX designer who focuses on creating intuitive UI that attains simplicity and convenience. As I extend my journey to become a Product Designer, I am gradually becoming more data-driven and I improve my design capability with cutting-edge web technologies like Figma, HTML/CSS/JS. Until today, my experience either as a UX Designer or as a Product Designer spans different industries such as B2B SaaS Enterprise, E-commerce, Non-Profit, or health tech. During my journey, I have also collaborated with UX researchers, PMs, and developers to extend my understanding and iterate business-respectful products or developer-friendly interfaces. Should you be curious to hear more about me, please do not hesitate to reach out to me at <a href='https://www.johnjang.ca/contact' target='_blank' style='display:inline-block; padding:8px 12px; color:#007bff; text-decoration:none; border-radius:5px;'>Contact</a>.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    };

    const chatGPTResponse = await fetch(`${OPENAI_API}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(chatGPTRequest),
    });

    const responseData = await chatGPTResponse.json();

    if (!responseData.choices || responseData.choices.length === 0) {
      throw new Error("No response from ChatGPT API.");
    }

    const chatGPTMessage = responseData.choices[0].message.content;

    res.json({ response: chatGPTMessage });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while processing your request.",
    });
  }
};
