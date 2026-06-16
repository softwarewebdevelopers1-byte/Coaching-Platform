import express from "express";
import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";
import DotEnvConfig from "./configs/DotEnv.js";
import DatabaseConnection from "./database/ConnectDB.js";
import BookingSlot from "./controllers/BookSlot.js";
import cors from "cors";
let app = express();
// Database connection function
DatabaseConnection();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET", "DELETE", "PUT"],
  }),
);
app.use("/api/bookings", BookingSlot);
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(500).send("Something broke!");
});
app.listen(DotEnvConfig.ServerPort, () => {
  console.log("Server started...", DotEnvConfig.ServerPort);
});
