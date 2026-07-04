import { Router } from "express";
import { BookingsCreatedModel, BookingsSessionsModel, } from "../models/Bookings.model.js";
import { ClientModel, NotificationModel, AppNotificationModel, } from "../models/Platform.model.js";
import { UserAccountsModel } from "../models/users.model.js";
import { sendBookingConfirmationEmail } from "../services/Brevo.emailSender.js";
import { programsMatch } from "../utils/programs.js";
const router = Router();
// ── GET all booking sessions (optionally filtered by email) ──────────────────
router.get("/sessions", async (req, res) => {
    const filter = req.query.email ? { email: String(req.query.email) } : {};
    const sessions = await BookingsSessionsModel.find(filter).sort({ _id: -1 });
    res.status(200).json({ sessions });
});
// ── GET all coach slots (optionally filtered by coachEmail) ──────────────────
router.get("/coach-slots", async (req, res) => {
    const filter = req.query.coachEmail
        ? { coachEmail: String(req.query.coachEmail) }
        : {};
    const slots = await BookingsCreatedModel.find(filter).sort({ bookingDate: 1 });
    res.status(200).json({ slots });
});
router.post("/assign-coach", async (req, res) => {
    const { programName, goals = [] } = req.body;
    if (!programName) {
        res.status(400).json({ message: "Program name is required" });
        return;
    }
    const coaches = await UserAccountsModel.find({
        role: "coach",
        status: "active",
    }).select("-password");
    const qualified = coaches.filter((coach) => coach.programName && programsMatch(coach.programName, programName));
    if (!qualified.length) {
        res.status(404).json({ message: "No qualified coaches are available for this program" });
        return;
    }
    const coachIds = qualified.map((coach) => String(coach._id));
    const openSlotCounts = await BookingsCreatedModel.aggregate([
        { $match: { coachId: { $in: coachIds }, status: "open" } },
        { $group: { _id: "$coachId", count: { $sum: 1 } } },
    ]);
    const openSlotsByCoach = new Map(openSlotCounts.map((item) => [item._id, item.count]));
    const normalizedGoals = Array.isArray(goals)
        ? goals.map((goal) => String(goal).toLowerCase())
        : [];
    const scored = qualified
        .map((coach) => {
        const workloadRatio = (coach.currentWorkload || 0) / Math.max(coach.maxWorkload || 10, 1);
        const availabilityScore = openSlotsByCoach.get(String(coach._id)) || 0;
        const expertiseText = [coach.programName, ...(coach.expertise || [])]
            .join(" ")
            .toLowerCase();
        const specializationScore = normalizedGoals.filter((goal) => expertiseText.includes(goal)).length;
        const experienceScore = Math.min(coach.experience || 0, 20) / 20;
        return {
            coach,
            score: availabilityScore * 4 +
                specializationScore * 3 +
                experienceScore * 2 -
                workloadRatio * 5,
        };
    })
        .sort((a, b) => b.score - a.score);
    const bestMatch = scored[0];
    if (!bestMatch) {
        res.status(404).json({ message: "No suitable coach could be assigned" });
        return;
    }
    res.status(200).json({
        coach: bestMatch.coach,
        rationale: {
            programFit: true,
            availabilityChecked: true,
            workloadChecked: true,
            specializationChecked: true,
        },
    });
});
// ── POST create a new coach slot ─────────────────────────────────────────────
router.post("/coach-slots", async (req, res) => {
    const { coachId, coachName, coachEmail, programName, title, bookingDate, bookingEndDate, imageUrl, } = req.body;
    if (!coachId || !coachName || !programName || !title || !bookingDate) {
        res.status(400).json({ message: "Missing required coach slot fields" });
        return;
    }
    const coachAccount = await UserAccountsModel.findById(coachId);
    if (!coachAccount || coachAccount.role !== "coach") {
        res.status(404).json({ message: "Coach not found" });
        return;
    }
    if (!coachAccount.programName) {
        res.status(400).json({
            message: "Please set your coaching program in Settings before creating slots",
        });
        return;
    }
    if (!programsMatch(coachAccount.programName, programName)) {
        res.status(400).json({
            message: "Slot program must match your configured coaching specialty",
        });
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
router.patch("/coach-slots/:id", async (req, res) => {
    const slot = await BookingsCreatedModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!slot) {
        res.status(404).json({ message: "Coach booking slot not found" });
        return;
    }
    res.status(200).json({ message: "Coach booking slot updated", slot });
});
// ── DELETE a coach slot ──────────────────────────────────────────────────────
router.delete("/coach-slots/:id", async (req, res) => {
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
router.post("/book-slot", async (req, res) => {
    if (!req.body) {
        res.status(400).json({ message: "Request body is missing" });
        return;
    }
    const email = req.body.email;
    const fullName = req.body.fullName;
    const phone = req.body.phoneNumber || req.body.phone;
    const country = req.body.country;
    const goals = Array.isArray(req.body.goals) ? req.body.goals.slice(0, 3) : [];
    const coachingType = req.body.coachingType;
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
    const coachAccount = await UserAccountsModel.findById(coachId);
    if (!coachAccount || coachAccount.role !== "coach") {
        res.status(404).json({ message: "Coach not found" });
        return;
    }
    if (!coachAccount.programName || !programsMatch(coachAccount.programName, program)) {
        res.status(400).json({
            message: "This coach does not offer the selected coaching program",
        });
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
        if (!programsMatch(slot.programName, program)) {
            res.status(400).json({
                message: "Selected slot does not match the chosen coaching program",
            });
            return;
        }
        if (slot.coachId !== String(coachId)) {
            res.status(400).json({ message: "Selected slot does not belong to this coach" });
            return;
        }
        const updatedSlot = await BookingsCreatedModel.findOneAndUpdate({ _id: slotId, status: "open" }, { status: "booked" }, { new: true });
        if (!updatedSlot) {
            res.status(409).json({ message: "This slot has already been booked" });
            return;
        }
    }
    await ClientModel.findOneAndUpdate({ email }, { fullName, email, phoneNumber: phone, country, goals }, { upsert: true, new: true, setDefaultsOnInsert: true });
    const booking = await BookingsSessionsModel.create({
        email,
        fullName,
        phoneNumber: phone,
        country,
        goals,
        coachingType,
        programName: program,
        coachId,
        coachName,
        coachEmail,
        coachPhone,
        bookingTime,
        status: "pending",
    });
    await AppNotificationModel.create({
        recipientId: coachId,
        title: "New Booking Confirmed",
        message: `Client ${fullName} booked a slot for ${program} on ${bookingTime}.`,
        type: "slot_booking",
        read: false,
    });
    await UserAccountsModel.findByIdAndUpdate(coachId, {
        $inc: { currentWorkload: 1 },
    });
    await AppNotificationModel.create({
        recipientId: coachId,
        title: "New booking received",
        message: `${fullName} booked a discovery session for ${program} with you.`,
        type: "slot_booking",
        read: false,
    });
    await NotificationModel.create({
        recipientEmail: email,
        recipientPhone: phone,
        channel: "email",
        type: "booking_confirmation",
        status: "queued",
        payload: { bookingId: booking._id, programName: program, coachName, bookingTime },
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
//# sourceMappingURL=BookSlot.js.map