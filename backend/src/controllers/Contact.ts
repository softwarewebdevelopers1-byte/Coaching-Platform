import { Router } from "express";
import {
  BookingsCreatedModel,
  BookingsSessionsModel,
} from "../models/Bookings.model.js";
import { ContactSubmissionModel } from "../models/Contact.model.js";
import { ClientModel, NotificationModel } from "../models/Platform.model.js";
import { SlotRequestModel } from "../models/SlotRequests.model.js";
import { UserAccountsModel } from "../models/users.model.js";
import {
  sendBookingConfirmationEmail,
  sendContactAcknowledgmentEmail,
  sendSlotRequestCoachNotificationEmail,
  sendSlotRequestReceivedEmail,
} from "../services/Brevo.emailSender.js";
import { interestToProgramSlug } from "../utils/contactLeads.js";
import { programsMatch } from "../utils/programs.js";

const router = Router();

router.post("/", async (req, res): Promise<void> => {
  const { name, email, phone, interest, goals, source } = req.body;

  if (!name || !email || !phone || !interest || !goals) {
    res.status(400).json({
      message: "Name, email, phone, interest, and goals are required",
    });
    return;
  }

  const submission = await ContactSubmissionModel.create({
    name,
    email,
    phone,
    interest,
    goals,
    source: source || "website",
    status: "new",
    programSlug: interestToProgramSlug(interest),
  });

  await NotificationModel.create({
    recipientEmail: email,
    recipientPhone: phone,
    channel: "email",
    type: "contact_acknowledgment",
    status: "queued",
    payload: {
      contactId: submission._id,
      interest,
      source: source || "website",
    },
  });

  sendContactAcknowledgmentEmail({
    email,
    name,
    interest,
  }).catch((error) => {
    console.log("Error sending contact acknowledgment email:", error);
  });

  res.status(201).json({
    message: "Contact submission received",
    submission,
  });
});

router.get("/", async (req, res): Promise<void> => {
  const filter: Record<string, string> = {};
  if (req.query.status) filter.status = String(req.query.status);
  if (req.query.interest) filter.interest = String(req.query.interest);

  const submissions = await ContactSubmissionModel.find(filter).sort({
    createdAt: -1,
  });
  res.status(200).json({ submissions });
});

router.patch("/:id", async (req, res): Promise<void> => {
  const { status, adminNotes, assignedCoachId, assignedCoachName } = req.body;
  const allowedStatuses = ["new", "contacted", "scheduled", "converted", "closed"];

  if (status && !allowedStatuses.includes(status)) {
    res.status(400).json({ message: "Invalid lead status" });
    return;
  }

  const update: Record<string, unknown> = {};
  if (status) {
    update.status = status;
    if (status === "contacted") update.contactedAt = new Date();
    if (status === "scheduled") update.scheduledAt = new Date();
  }
  if (adminNotes !== undefined) update.adminNotes = adminNotes;
  if (assignedCoachId !== undefined) update.assignedCoachId = assignedCoachId;
  if (assignedCoachName !== undefined) update.assignedCoachName = assignedCoachName;

  const submission = await ContactSubmissionModel.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true },
  );

  if (!submission) {
    res.status(404).json({ message: "Contact submission not found" });
    return;
  }

  res.status(200).json({ message: "Lead updated", submission });
});

router.post("/:id/schedule", async (req, res): Promise<void> => {
  const lead = await ContactSubmissionModel.findById(req.params.id);
  if (!lead) {
    res.status(404).json({ message: "Contact submission not found" });
    return;
  }

  const {
    action = "book",
    programName,
    coachId,
    coachName,
    coachEmail,
    coachPhone,
    slotId,
    bookingTime,
    message,
  } = req.body;

  const resolvedProgram =
    programName || lead.programSlug || interestToProgramSlug(lead.interest);

  if (!resolvedProgram) {
    res.status(400).json({
      message:
        "Program is required for leads interested in both individual and group coaching",
    });
    return;
  }

  if (!coachId || !coachName || !coachEmail) {
    res.status(400).json({ message: "Coach details are required" });
    return;
  }

  const coachAccount = await UserAccountsModel.findById(coachId);
  if (!coachAccount || coachAccount.role !== "coach") {
    res.status(404).json({ message: "Coach not found" });
    return;
  }

  if (
    !coachAccount.programName ||
    !programsMatch(coachAccount.programName, resolvedProgram)
  ) {
    res.status(400).json({
      message: "This coach does not offer the selected coaching program",
    });
    return;
  }

  const goals = lead.goals
    ? lead.goals.split(/[,;\n]/).map((g) => g.trim()).filter(Boolean).slice(0, 3)
    : [];

  if (action === "slot_request") {
    const slotRequest = await SlotRequestModel.create({
      fullName: lead.name,
      email: lead.email,
      phoneNumber: lead.phone,
      programName: resolvedProgram,
      coachId,
      coachName,
      coachEmail,
      message: message || `Contact form lead: ${lead.goals}`,
      status: "pending",
    });

    await ContactSubmissionModel.findByIdAndUpdate(lead._id, {
      status: "contacted",
      contactedAt: new Date(),
      programSlug: resolvedProgram,
      assignedCoachId: coachId,
      assignedCoachName: coachName,
      adminNotes: lead.adminNotes,
    });

    sendSlotRequestReceivedEmail({
      email: lead.email,
      fullName: lead.name,
      programName: resolvedProgram,
      coachName,
      coachEmail,
    }).catch((error) => {
      console.log("Error sending slot request received email:", error);
    });

    sendSlotRequestCoachNotificationEmail({
      coachEmail,
      coachName,
      fullName: lead.name,
      email: lead.email,
      phoneNumber: lead.phone,
      programName: resolvedProgram,
      message: message || lead.goals,
    }).catch((error) => {
      console.log("Error sending coach notification email:", error);
    });

    res.status(201).json({
      message: "Slot request created for contact lead",
      slotRequest,
      submission: await ContactSubmissionModel.findById(lead._id),
    });
    return;
  }

  if (!bookingTime) {
    res.status(400).json({ message: "Booking time is required" });
    return;
  }

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
    if (!programsMatch(slot.programName, resolvedProgram)) {
      res.status(400).json({
        message: "Selected slot does not match the chosen coaching program",
      });
      return;
    }
    if (slot.coachId !== String(coachId)) {
      res.status(400).json({ message: "Selected slot does not belong to this coach" });
      return;
    }
    const updatedSlot = await BookingsCreatedModel.findOneAndUpdate(
      { _id: slotId, status: "open" },
      { status: "booked" },
      { new: true },
    );
    if (!updatedSlot) {
      res.status(409).json({ message: "This slot has already been booked" });
      return;
    }
  }

  await ClientModel.findOneAndUpdate(
    { email: lead.email },
    {
      fullName: lead.name,
      email: lead.email,
      phoneNumber: lead.phone,
      goals,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const booking = await BookingsSessionsModel.create({
    email: lead.email,
    fullName: lead.name,
    phoneNumber: lead.phone,
    goals,
    coachingType: "Discovery call",
    programName: resolvedProgram,
    coachId,
    coachName,
    coachEmail,
    coachPhone: coachPhone || "",
    bookingTime,
    status: "pending",
  });

  await UserAccountsModel.findByIdAndUpdate(coachId, {
    $inc: { currentWorkload: 1 },
  });

  await NotificationModel.create({
    recipientEmail: lead.email,
    recipientPhone: lead.phone,
    channel: "email",
    type: "booking_confirmation",
    status: "queued",
    payload: {
      bookingId: booking._id,
      programName: resolvedProgram,
      coachName,
      bookingTime,
      source: "contact_lead",
    },
  });

  sendBookingConfirmationEmail({
    email: lead.email,
    fullName: lead.name,
    phoneNumber: lead.phone,
    programName: resolvedProgram,
    coachId,
    coachName,
    coachEmail,
    coachPhone,
    bookingTime,
  }).catch((error) => {
    console.log("Error sending booking confirmation email:", error);
  });

  const submission = await ContactSubmissionModel.findByIdAndUpdate(
    lead._id,
    {
      status: "scheduled",
      scheduledAt: new Date(),
      programSlug: resolvedProgram,
      assignedCoachId: coachId,
      assignedCoachName: coachName,
      bookingSessionId: String(booking._id),
    },
    { new: true },
  );

  res.status(201).json({
    message: "Discovery call scheduled for contact lead",
    booking,
    submission,
  });
});

export default router;
