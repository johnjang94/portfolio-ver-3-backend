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
            "I am a professional developer specializing in web applications, as described on my website, www.johnjang.ca. I focus on creating modern, user-friendly interfaces and delivering high-quality projects for my clients. If you'd like to know more about my skills or services, feel free to ask!",
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
