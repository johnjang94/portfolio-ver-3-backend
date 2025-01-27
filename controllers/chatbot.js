import fetch from "node-fetch";
import User from "../models/user.js";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const chat = async (req, res) => {
  try {
    const { userId, message } = req.body;

    let user = await User.findOne({ userId });
    if (!user) {
      user = new User({ userId, state: { step: "greet" } });
      await user.save();
    }

    const chatGPTResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant for www.johnjang.ca.",
            },
            { role: "user", content: message },
          ],
        }),
      }
    );

    const responseData = await chatGPTResponse.json();

    if (!responseData.choices || responseData.choices.length === 0) {
      throw new Error("No response from ChatGPT API.");
    }

    const chatGPTMessage = responseData.choices[0].message.content;

    res.json({ response: chatGPTMessage });
  } catch (error) {
    console.error("Error handling chat request:", error);
    res.status(500).json({
      error: "An error occurred while processing your request.",
    });
  }
};
