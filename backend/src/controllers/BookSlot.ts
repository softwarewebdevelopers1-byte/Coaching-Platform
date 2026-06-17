import { Router } from "express";
import {
  BookingsCreatedModel,
  BookingsSessionsModel,
} from "../models/Bookings.model.js";
import { sendBookingConfirmationEmail } from "../services/Brevo.emailSender.js";

const router = Router();

// ── GET all booking sessions (optionally filtered by email) ──────────────────
router.get("/sessions", async (req, res): Promise<void> => {
  const filter = req.query.email ? { email: String(req.query.email) } : {};
  const sessions = await BookingsSessionsModel.find(filter).sort({ _id: -1 });
  res.status(200).json({ sessions });
});

// ── GET all coach slots (optionally filtered by coachEmail) ──────────────────
router.get("/coach-slots", async (req, res): Promise<void> => {
  const filter = req.query.coachEmail
    ? { coachEmail: String(req.query.coachEmail) }
    : {};
  const slots = await BookingsCreatedModel.find(filter).sort({ bookingDate: 1 });
  res.status(200).json({ slots });
});

// ── POST create a new coach slot ─────────────────────────────────────────────
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

// ── PATCH update a coach slot ────────────────────────────────────────────────
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

// ── DELETE a coach slot ──────────────────────────────────────────────────────
router.delete("/coach-slots/:id", async (req, res): Promise<void> => {
  const slot = await BookingsCreatedModel.findById(req.params.id);

  if (!slot) {
    res.status(404).json({ message: "Coach slot not found" });
    return;
  }

  if (slot.status === "booked") {
    res.status(400).json({ message: "Cannot delete a slot that is already booked" });
    return;
  }

  await BookingsCreatedModel.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Coach slot deleted successfully" });
});

// ── POST book a slot (user books a coach slot) ───────────────────────────────
router.post("/book-slot", async (req, res): Promise<void> => {
  if (!req.body) {
    res.status(400).json({ message: "Request body is missing" });
    return;
  }

  const email = req.body.email;
  const fullName = req.body.fullName;
  const phone = req.body.phoneNumber || req.body.phone;
  const program = req.body.programName || req.body.program;
  const coachId = req.body.coachingId || req.body.coachId;
  const coachName = req.body.coachName;
  const coachEmail = req.body.coachEmail;
  const coachPhone = req.body.coachPhone;
  const bookingTime = req.body.bookingTime || req.body.slot;
  const slotId = req.body.slotId;

  if (!email || !fullName || !phone || !program || !coachId || !bookingTime) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  // Mark the slot as booked if a slotId was provided
  if (slotId) {
    const slot = await BookingsCreatedModel.findById(slotId);
    if (!slot) {
      res.status(404).json({ message: "Slot not found" });
      return;
    }
    if (slot.status === "booked") {
      res.status(409).json({ message: "This slot has already been booked" });
      return;
    }
    await BookingsCreatedModel.findByIdAndUpdate(slotId, { status: "booked" });
  }

  const booking = await BookingsSessionsModel.create({
    email,
    fullName,
    phoneNumber: phone,
    programName: program,
    coachId,
    coachName,
    coachEmail,
    coachPhone,
    bookingTime,
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
