import fetch from "node-fetch";
import User from "../models/user.js";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API = process.env.OPENAI_API;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const chat = async (req, res) => {
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
            "You are a helpful assistant for the website www.johnjang.ca. Only provide information based on this website and its content. Do not reference any other John Jang who is unrelated to this website.",
        },
        {
          role: "user",
          content: "Tell me about John Jang.",
        },
        {
          role: "assistant",
          content:
            "John Jang is a professional developer specializing in web applications, as described on www.johnjang.ca. He focuses on creating modern, user-friendly interfaces and delivering high-quality projects for his clients.",
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
