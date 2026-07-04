import mongoose from "mongoose";
const ProgramSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    benefits: [{ type: String }],
    outcomes: [{ type: String }],
    status: { type: String, enum: ["active", "archived"], default: "active" },
}, { timestamps: true });
const ClientSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phoneNumber: { type: String },
    country: { type: String },
    goals: [{ type: String }],
}, { timestamps: true });
const NotificationSchema = new mongoose.Schema({
    recipientEmail: { type: String, required: true, index: true },
    recipientPhone: { type: String },
    channel: { type: String, enum: ["email", "whatsapp"], default: "email" },
    type: {
        type: String,
        enum: [
            "booking_confirmation",
            "booking_approval",
            "booking_rejection",
            "session_reminder",
            "reschedule_notice",
            "contact_acknowledgment",
        ],
        required: true,
    },
    status: { type: String, enum: ["queued", "sent", "failed"], default: "queued" },
    payload: { type: Object, default: {} },
}, { timestamps: true });
const TestimonialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    text: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
}, { timestamps: true });
const SessionNoteSchema = new mongoose.Schema({
    bookingId: { type: String, required: true, index: true },
    coachId: { type: String, required: true, index: true },
    clientEmail: { type: String, required: true, index: true },
    privateNotes: { type: String, required: true },
    nextSteps: { type: String },
}, { timestamps: true });
const ProgramModel = mongoose.models.programs ||
    mongoose.model("programs", ProgramSchema);
const ClientModel = mongoose.models.clients ||
    mongoose.model("clients", ClientSchema);
const NotificationModel = mongoose.models.notifications ||
    mongoose.model("notifications", NotificationSchema);
const TestimonialModel = mongoose.models.testimonials ||
    mongoose.model("testimonials", TestimonialSchema);
const SessionNoteModel = mongoose.models.session_notes ||
    mongoose.model("session_notes", SessionNoteSchema);
const AppNotificationSchema = new mongoose.Schema({
    recipientId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    type: {
        type: String,
        enum: ["contact_submission", "slot_request", "slot_booking"],
        required: true,
    },
}, { timestamps: true });
const AppNotificationModel = mongoose.models.app_notifications ||
    mongoose.model("app_notifications", AppNotificationSchema);
export { ClientModel, NotificationModel, ProgramModel, SessionNoteModel, TestimonialModel, AppNotificationModel, };
//# sourceMappingURL=Platform.model.js.map