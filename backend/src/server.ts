import express from "express";
import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";
import path from "path";
import DotEnvConfig from "./configs/DotEnv.js";
import DatabaseConnection from "./database/ConnectDB.js";
import BookingSlot from "./controllers/BookSlot.js";
import Accounts from "./controllers/Accounts.js";
import SlotRequests from "./controllers/SlotRequests.js";
import Platform from "./controllers/Platform.js";
import Contact from "./controllers/Contact.js";
import AIChat from "./controllers/AIChat.js";
import cors from "cors";
let app = express();
// Database connection function
DatabaseConnection();

app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    origin: ["http://localhost:5173", "https://coaching-platform-rust.vercel.app"],
    methods: ["POST", "GET", "DELETE", "PUT", "PATCH"],
  }),
);
app.use("/api/bookings", BookingSlot);
app.use("/api/accounts", Accounts);
app.use("/api/slot-requests", SlotRequests);
app.use("/api/platform", Platform);
app.use("/api/contact", Contact);
app.use("/api/ai", AIChat);
app.listen(DotEnvConfig.ServerPort||process.env.PORT, () => {
  console.log("Server started...", DotEnvConfig.ServerPort);
});
