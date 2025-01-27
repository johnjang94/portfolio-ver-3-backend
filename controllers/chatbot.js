const User = require("../models/user");
require("dotenv").config();

module.exports = {
  chat: async (req, res) => {
    try {
      const { userId } = req.body;

      let user = await User.findOne({ userId });
      if (!user) {
        user = new User({ userId, state: { step: "greet" } });
        await user.save();
      }

      res.json({ response: ["Message received successfully."] });
    } catch (error) {
      console.error("Error handling chat request:", error);
      res.status(500).json({
        error: "An error occurred while processing your request.",
      });
    }
  },
};
