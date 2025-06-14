// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import userRoutes from "./routes/user.js";
import { startSwapListener } from "./listeners/swapListener.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to MongoDB
await connectDB();

// API Routes
app.use("/api", userRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Start listening to Swapped events
startSwapListener();
