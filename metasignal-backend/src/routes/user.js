// src/routes/user.js
import express from "express";
import User from "../models/User.js";
import Feed from "../models/Feed.js";

const router = express.Router();

//
// 🔐 POST /api/register
// Registers a wallet address
//
router.post("/register", async (req, res) => {
  const { address } = req.body;

  if (!address) return res.status(400).json({ error: "Address required" });

  try {
    let user = await User.findOne({ address });
    if (!user) {
      user = await User.create({ address });
    }
    return res.json({ success: true, user });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//
// ➕ POST /api/follow
// Add a wallet to follow list
//
router.post("/follow", async (req, res) => {
  const { address, follow } = req.body;

  if (!address || !follow) return res.status(400).json({ error: "address and follow required" });

  try {
    const user = await User.findOne({ address });
    if (!user) return res.status(404).json({ error: "User not registered" });

    if (!user.follows.includes(follow)) {
      user.follows.push(follow);
      await user.save();
    }

    res.json({ success: true, follows: user.follows });
  } catch (err) {
    console.error("❌ Follow error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//
// 📡 GET /api/feed?address=0x123...
// Get feed for the user
//
router.get("/feed", async (req, res) => {
  const address = req.query.address;

  if (!address) return res.status(400).json({ error: "address required" });

  try {
    const feed = await Feed.findOne({ owner: address });
    res.json({ events: feed?.events || [] });
  } catch (err) {
    console.error("❌ Feed error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
