import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  state: {
    type: Object,
    default: { step: "greet" },
  },
});

const User = mongoose.model("User", userSchema);

export default User;
