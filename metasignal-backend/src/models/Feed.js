import mongoose from "mongoose";

const feedSchema = new mongoose.Schema({
  owner: { type: String, required: true }, // Follower
  events: [
    {
      type: String, // "swap"
      actor: String,
      tokenIn: String,
      tokenOut: String,
      amountIn: String,
      amountOut: String,
      timestamp: Number,
      txHash: String,
    },
  ],
});

export default mongoose.model("Feed", feedSchema);
