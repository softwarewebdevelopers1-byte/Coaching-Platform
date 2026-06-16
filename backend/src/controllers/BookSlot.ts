import { Router } from "express";
import { BookingsSessionsModel } from "../models/Bookings.model.js";

const router = Router();

router.post("/book-slot", async (req, res): Promise<void> => {
  if (!req.body) {
    res.status(400).json({ message: "Request body is missing" });
    return;
  }
  let email = req.body.email;
  let fullName = req.body.fullName;
  let phone = req.body.phoneNumber;
  let program = req.body.programName;
  let coachId = req.body.coachingId;
  let bookingTime = req.body.bookingTime;
  if (!email || !fullName || !phone || !program || !coachId || !bookingTime) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }
  await BookingsSessionsModel.create({
    email: email,
    fullName: fullName,
    phoneNumber: phone,
    programName: program,
    coachId: coachId,
    bookingTime: bookingTime,
  });
  res.status(201).json({ message: "Slot booked successfully" });
});
export default router;
