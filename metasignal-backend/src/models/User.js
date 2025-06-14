import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  address: { type: String, unique: true, required: true },
  follows: { type: [String], default: [] },
});

export default mongoose.model("User", userSchema);
