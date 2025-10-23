import express from "express";
import cors from "cors";
import { config } from "dotenv";

// Import route files
import userRoutes from "./routes/users.js";
import batchRoutes from "./routes/batches.js";
import attendanceRoutes from "./routes/attendance.js";
import authRoutes from "./routes/auth.js";


config(); // Load environment variables from .env

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/attendance", attendanceRoutes);

app.use("/api/auth", authRoutes);
// Test root endpoint
app.get("/", (req, res) => {
  res.send("✅ Attendance API is running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
