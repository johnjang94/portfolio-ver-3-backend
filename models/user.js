const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  state: {
    type: Object,
    default: { step: "greet" },
  },
});

module.exports = mongoose.model("User", userSchema);
