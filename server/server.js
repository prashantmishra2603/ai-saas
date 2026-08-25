import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import userRouter from "./routes/userRouts.js";

const app = express();

await connectCloudinary();

app.use(cors());
app.use(express.json());
// Initialize Clerk middleware safely
try {
  if (process.env.CLERK_SECRET_KEY && process.env.CLERK_SECRET_KEY.trim() !== "") {
    app.use(clerkMiddleware());
  } else {
    console.warn("⚠️ CLERK_SECRET_KEY is not set. Using JWT fallback authentication.");
  }
} catch (e) {
  console.warn("Clerk middleware init warning:", e.message);
}

app.get("/", (req, res) => res.send("Server is Live!"));

// Protected API routes (each route applies auth middleware)
app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});