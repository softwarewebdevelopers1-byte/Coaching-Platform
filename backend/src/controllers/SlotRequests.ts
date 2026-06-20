import { Router } from "express";
import { SlotRequestModel } from "../models/SlotRequests.model.js";
import { BookingsSessionsModel } from "../models/Bookings.model.js";
import {
  sendSlotRequestReceivedEmail,
  sendSlotRequestApprovedEmail,
  sendSlotRequestDeclinedEmail,
  sendSlotRequestCoachNotificationEmail,
} from "../services/Brevo.emailSender.js";
import { programsMatch } from "../utils/programs.js";

const router = Router();

// ── POST create a new slot request (user submits) ────────────────────────────
router.post("/", async (req, res): Promise<void> => {
  const {
    fullName,
    email,
    phoneNumber,
    programName,
    coachId,
    coachName,
    coachEmail,
    message,
  } = req.body;

  if (!fullName || !email || !phoneNumber || !programName || !coachId || !coachName || !coachEmail) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  const coachAccount = await UserAccountsModel.findById(coachId);
  if (!coachAccount || coachAccount.role !== "coach") {
    res.status(404).json({ message: "Coach not found" });
    return;
  }

  if (!coachAccount.programName || !programsMatch(coachAccount.programName, programName)) {
    res.status(400).json({
      message: "This coach does not offer the selected coaching program",
    });
    return;
  }

  const slotRequest = await SlotRequestModel.create({
    fullName,
    email,
    phoneNumber,
    programName,
    coachId,
    coachName,
    coachEmail,
    message: message || "",
    status: "pending",
  });

  sendSlotRequestReceivedEmail({
    email,
    fullName,
    programName,
    coachName,
    coachEmail,
  }).catch((error) => {
    console.log("Error sending slot request received email:", error);
  });

  sendSlotRequestCoachNotificationEmail({
    coachEmail,
    coachName,
    fullName,
    email,
    phoneNumber,
    programName,
    message: message || "",
  }).catch((error) => {
    console.log("Error sending coach notification email:", error);
  });

  res.status(201).json({
    message: "Session request submitted successfully",
    slotRequest,
  });
});

// ── GET list slot requests (optional coachEmail filter) ──────────────────────
router.get("/", async (req, res): Promise<void> => {
  const filter: Record<string, string> = {};
  if (req.query.coachEmail) {
    filter.coachEmail = String(req.query.coachEmail);
  }
  if (req.query.email) {
    filter.email = String(req.query.email);
  }
  if (req.query.status) {
    filter.status = String(req.query.status);
  }

  const slotRequests = await SlotRequestModel.find(filter).sort({ _id: -1 });
  res.status(200).json({ slotRequests });
});

// ── PATCH approve a slot request (coach sets time) ───────────────────────────
router.patch("/:id/approve", async (req, res): Promise<void> => {
  const { scheduledTime, coachNotes, coachPhone } = req.body;

  if (!scheduledTime) {
    res.status(400).json({ message: "Scheduled time is required to approve" });
    return;
  }

  const slotRequest = await SlotRequestModel.findById(req.params.id);

  if (!slotRequest) {
    res.status(404).json({ message: "Slot request not found" });
    return;
  }

  if (slotRequest.status !== "pending") {
    res.status(400).json({ message: `Cannot approve a request that is already ${slotRequest.status}` });
    return;
  }

  slotRequest.status = "approved";
  slotRequest.scheduledTime = scheduledTime;
  slotRequest.coachNotes = coachNotes || "";
  await slotRequest.save();

  await BookingsSessionsModel.create({
    email: slotRequest.email,
    fullName: slotRequest.fullName,
    phoneNumber: slotRequest.phoneNumber,
    programName: slotRequest.programName,
    coachId: slotRequest.coachId,
    coachName: slotRequest.coachName,
    coachEmail: slotRequest.coachEmail,
    coachPhone: coachPhone || "",
    bookingTime: scheduledTime,
  });

  sendSlotRequestApprovedEmail({
    email: slotRequest.email,
    fullName: slotRequest.fullName,
    programName: slotRequest.programName,
    coachName: slotRequest.coachName,
    coachEmail: slotRequest.coachEmail,
    coachPhone: coachPhone || "",
    scheduledTime,
    coachNotes: coachNotes || "",
  }).catch((error) => {
    console.log("Error sending slot request approved email:", error);
  });

  res.status(200).json({
    message: "Slot request approved and client notified",
    slotRequest,
    booking,
  });
});

// ── PATCH decline a slot request ─────────────────────────────────────────────
router.patch("/:id/decline", async (req, res): Promise<void> => {
  const slotRequest = await SlotRequestModel.findById(req.params.id);

  if (!slotRequest) {
    res.status(404).json({ message: "Slot request not found" });
    return;
  }

  if (slotRequest.status !== "pending") {
    res.status(400).json({ message: `Cannot decline a request that is already ${slotRequest.status}` });
    return;
  }

  slotRequest.status = "declined";
  await slotRequest.save();

  sendSlotRequestDeclinedEmail({
    email: slotRequest.email,
    fullName: slotRequest.fullName,
    programName: slotRequest.programName,
    coachName: slotRequest.coachName,
    coachEmail: slotRequest.coachEmail,
  }).catch((error) => {
    console.log("Error sending slot request declined email:", error);
  });

  res.status(200).json({
    message: "Slot request declined",
    slotRequest,
  });
});

export default router;
