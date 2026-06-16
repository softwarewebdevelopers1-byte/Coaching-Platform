import { Router } from "express";
import {
  BookingsCreatedModel,
  BookingsSessionsModel,
} from "../models/Bookings.model.js";
import { sendBookingConfirmationEmail } from "../services/Brevo.emailSender.js";

const router = Router();

router.get("/sessions", async (req, res): Promise<void> => {
  const filter = req.query.email ? { email: String(req.query.email) } : {};
  const sessions = await BookingsSessionsModel.find(filter).sort({ _id: -1 });
  res.status(200).json({ sessions });
});

router.get("/coach-slots", async (_req, res): Promise<void> => {
  const slots = await BookingsCreatedModel.find().sort({ bookingDate: 1 });
  res.status(200).json({ slots });
});

router.post("/coach-slots", async (req, res): Promise<void> => {
  const {
    coachId,
    coachName,
    coachEmail,
    programName,
    title,
    bookingDate,
    bookingEndDate,
    imageUrl,
  } = req.body;

  if (!coachId || !coachName || !programName || !title || !bookingDate) {
    res.status(400).json({ message: "Missing required coach slot fields" });
    return;
  }

  const startDate = new Date(bookingDate);
  const endDate = bookingEndDate
    ? new Date(bookingEndDate)
    : new Date(startDate.getTime() + 60 * 60 * 1000);

  const slot = await BookingsCreatedModel.create({
    coachId,
    coachName,
    coachEmail,
    programName,
    title,
    imageUrl,
    bookingDate: startDate,
    bookingEndDate: endDate,
    status: "open",
  });

  res.status(201).json({ message: "Coach booking slot created", slot });
});

router.patch("/coach-slots/:id", async (req, res): Promise<void> => {
  const slot = await BookingsCreatedModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );

  if (!slot) {
    res.status(404).json({ message: "Coach booking slot not found" });
    return;
  }

  res.status(200).json({ message: "Coach booking slot updated", slot });
});

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
