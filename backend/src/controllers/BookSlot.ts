import { Router } from "express";
import { BookingsSessionsModel } from "../models/Bookings.model.js";
import { sendBookingConfirmationEmail } from "../services/Brevo.emailSender.js";

const router = Router();

router.post("/book-slot", async (req, res): Promise<void> => {
  if (!req.body) {
    res.status(400).json({ message: "Request body is missing" });
    return;
  }
  let email = req.body.email;
  let fullName = req.body.fullName;
  let phone = req.body.phoneNumber || req.body.phone;
  let program = req.body.programName || req.body.program;
  let coachId = req.body.coachingId || req.body.coachId;
  let coachName = req.body.coachName;
  let coachEmail = req.body.coachEmail;
  let coachPhone = req.body.coachPhone;
  let bookingTime = req.body.bookingTime || req.body.slot;
  if (!email || !fullName || !phone || !program || !coachId || !bookingTime) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }
  const booking = await BookingsSessionsModel.create({
    email: email,
    fullName: fullName,
    phoneNumber: phone,
    programName: program,
    coachId: coachId,
    coachName: coachName,
    coachEmail: coachEmail,
    coachPhone: coachPhone,
    bookingTime: bookingTime,
  });
  sendBookingConfirmationEmail({
    email,
    fullName,
    phoneNumber: phone,
    programName: program,
    coachId,
    coachName,
    coachEmail,
    coachPhone,
    bookingTime,
  }).catch((error) => {
    console.log(error);
  });
  res.status(201).json({ message: "Slot booked successfully", booking });
});
export default router;
