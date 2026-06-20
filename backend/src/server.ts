import express from "express";
import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";
import DotEnvConfig from "./configs/DotEnv.js";
import DatabaseConnection from "./database/ConnectDB.js";
import BookingSlot from "./controllers/BookSlot.js";
import Accounts from "./controllers/Accounts.js";
import SlotRequests from "./controllers/SlotRequests.js";
import cors from "cors";
let app = express();
// Database connection function
DatabaseConnection();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    methods: ["POST", "GET", "DELETE", "PUT", "PATCH"],
  }),
);
app.use("/api/bookings", BookingSlot);
app.use("/api/accounts", Accounts);
app.use("/api/slot-requests", SlotRequests);
app.listen(DotEnvConfig.ServerPort||process.env.PORT, () => {
  console.log("Server started...", DotEnvConfig.ServerPort);
});
