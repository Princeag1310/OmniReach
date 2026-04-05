import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import pino from "pino";
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import { initScheduler } from "./cron/scheduler.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const logger = pino({ transport: { target: "pino-pretty" } });

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info("MongoDB Connected Successfully"))
  .catch((err) => logger.error("MongoDB Connection Error:", err));

// Global Object to hold our socket instance so routes can emit events
app.set('io', io);

io.on("connection", (socket) => {
  logger.info(`New client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Initialize Cron Scheduler
initScheduler(io);

// Unprotected Webhook Routes
app.use("/api/webhooks", webhookRoutes);

// Import Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/templates", templateRoutes);
app.get("/api/health", (req, res) => res.status(200).json({ status: "OK", awsRegion: process.env.AWS_REGION }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`OmniReach server running on port ${PORT}`);
});
