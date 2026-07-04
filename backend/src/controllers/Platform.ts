import { Router } from "express";
import {
  NotificationModel,
  ProgramModel,
  SessionNoteModel,
  TestimonialModel,
  AppNotificationModel,
} from "../models/Platform.model.js";
import {
  BookingsCreatedModel,
  BookingsSessionsModel,
} from "../models/Bookings.model.js";
import { UserAccountsModel } from "../models/users.model.js";
import { ContactSubmissionModel } from "../models/Contact.model.js";

const router = Router();

router.get("/programs", async (_req, res): Promise<void> => {
  const programs = await ProgramModel.find({ status: "active" }).sort({ createdAt: -1 });
  res.status(200).json({ programs });
});

router.post("/programs", async (req, res): Promise<void> => {
  const program = await ProgramModel.findOneAndUpdate(
    { slug: req.body.slug },
    req.body,
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  res.status(201).json({ program });
});

router.get("/testimonials", async (req, res): Promise<void> => {
  const filter: Record<string, unknown> = req.query.status
    ? { status: String(req.query.status) }
    : {};
  const testimonials = await TestimonialModel.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ testimonials });
});

router.post("/testimonials", async (req, res): Promise<void> => {
  const testimonial = await TestimonialModel.create(req.body);
  res.status(201).json({ testimonial });
});

router.put("/testimonials/:id", async (req, res): Promise<void> => {
  const testimonial = await TestimonialModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!testimonial) {
    res.status(404).json({ message: "Testimonial not found" });
    return;
  }
  res.status(200).json({ testimonial });
});

router.get("/notifications", async (_req, res): Promise<void> => {
  const notifications = await NotificationModel.find().sort({ createdAt: -1 }).limit(100);
  res.status(200).json({ notifications });
});

router.post("/session-notes", async (req, res): Promise<void> => {
  const note = await SessionNoteModel.create(req.body);
  res.status(201).json({ note });
});

router.get("/session-notes", async (req, res): Promise<void> => {
  const filter: Record<string, string> = {};
  if (req.query.coachId) filter.coachId = String(req.query.coachId);
  if (req.query.clientEmail) filter.clientEmail = String(req.query.clientEmail);
  const notes = await SessionNoteModel.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ notes });
});

router.get("/analytics", async (_req, res): Promise<void> => {
  const [
    coaches,
    activeCoaches,
    bookings,
    openSlots,
    bookedSlots,
    notifications,
    contactLeads,
    newLeads,
    contactedLeads,
    scheduledLeads,
    convertedLeads,
    closedLeads,
    individualInterest,
    groupInterest,
    bothInterest,
  ] = await Promise.all([
    UserAccountsModel.countDocuments({ role: "coach" }),
    UserAccountsModel.countDocuments({ role: "coach", status: "active" }),
    BookingsSessionsModel.countDocuments(),
    BookingsCreatedModel.countDocuments({ status: "open" }),
    BookingsCreatedModel.countDocuments({ status: "booked" }),
    NotificationModel.countDocuments(),
    ContactSubmissionModel.countDocuments(),
    ContactSubmissionModel.countDocuments({ status: "new" }),
    ContactSubmissionModel.countDocuments({ status: "contacted" }),
    ContactSubmissionModel.countDocuments({ status: "scheduled" }),
    ContactSubmissionModel.countDocuments({ status: "converted" }),
    ContactSubmissionModel.countDocuments({ status: "closed" }),
    ContactSubmissionModel.countDocuments({
      interest: "Individual Executive Coaching",
    }),
    ContactSubmissionModel.countDocuments({
      interest: "Group Executive Coaching",
    }),
    ContactSubmissionModel.countDocuments({ interest: "Both" }),
  ]);

  const leadToBookingConversionRate =
    contactLeads > 0 ? Number((scheduledLeads / contactLeads).toFixed(2)) : 0;

  res.status(200).json({
    analytics: {
      coaches,
      activeCoaches,
      bookings,
      openSlots,
      bookedSlots,
      notifications,
      contactLeads,
      leadsByStatus: {
        new: newLeads,
        contacted: contactedLeads,
        scheduled: scheduledLeads,
        converted: convertedLeads,
        closed: closedLeads,
      },
      leadsByInterest: {
        individual: individualInterest,
        group: groupInterest,
        both: bothInterest,
      },
      leadToBookingConversionRate,
      generatedAt: new Date().toISOString(),
    },
  });
});

router.get("/app-notifications", async (req, res): Promise<void> => {
  const { recipientId } = req.query;
  if (!recipientId) {
    res.status(400).json({ message: "recipientId is required" });
    return;
  }

  const notifications = await AppNotificationModel.find({ recipientId: String(recipientId) })
    .sort({ createdAt: -1 })
    .limit(100);

  res.status(200).json({ notifications });
});

router.patch("/app-notifications/:id/read", async (req, res): Promise<void> => {
  const notification = await AppNotificationModel.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );

  if (!notification) {
    res.status(404).json({ message: "Notification not found" });
    return;
  }

  res.status(200).json({ message: "Notification marked as read", notification });
});

router.patch("/app-notifications/read-all", async (req, res): Promise<void> => {
  const { recipientId } = req.body;
  if (!recipientId) {
    res.status(400).json({ message: "recipientId is required" });
    return;
  }

  await AppNotificationModel.updateMany(
    { recipientId: String(recipientId), read: false },
    { read: true }
  );

  res.status(200).json({ message: "All notifications marked as read" });
});

export default router;
