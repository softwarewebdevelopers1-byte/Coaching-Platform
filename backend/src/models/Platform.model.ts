import mongoose, { Model } from "mongoose";

interface ProgramInterface {
  title: string;
  slug: string;
  description: string;
  benefits: string[];
  outcomes: string[];
  status: "active" | "archived";
}

interface ClientInterface {
  fullName: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  goals: string[];
}

interface NotificationInterface {
  recipientEmail: string;
  recipientPhone?: string;
  channel: "email" | "whatsapp";
  type:
    | "booking_confirmation"
    | "booking_approval"
    | "booking_rejection"
    | "session_reminder"
    | "reschedule_notice";
  status: "queued" | "sent" | "failed";
  payload: Record<string, unknown>;
}

interface TestimonialInterface {
  name: string;
  role: string;
  text: string;
  rating: number;
  status: "draft" | "published";
}

interface SessionNoteInterface {
  bookingId: string;
  coachId: string;
  clientEmail: string;
  privateNotes: string;
  nextSteps?: string;
}

const ProgramSchema = new mongoose.Schema<ProgramInterface>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    benefits: [{ type: String }],
    outcomes: [{ type: String }],
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true },
);

const ClientSchema = new mongoose.Schema<ClientInterface>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phoneNumber: { type: String },
    country: { type: String },
    goals: [{ type: String }],
  },
  { timestamps: true },
);

const NotificationSchema = new mongoose.Schema<NotificationInterface>(
  {
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
      ],
      required: true,
    },
    status: { type: String, enum: ["queued", "sent", "failed"], default: "queued" },
    payload: { type: Object, default: {} },
  },
  { timestamps: true },
);

const TestimonialSchema = new mongoose.Schema<TestimonialInterface>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    text: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true },
);

const SessionNoteSchema = new mongoose.Schema<SessionNoteInterface>(
  {
    bookingId: { type: String, required: true, index: true },
    coachId: { type: String, required: true, index: true },
    clientEmail: { type: String, required: true, index: true },
    privateNotes: { type: String, required: true },
    nextSteps: { type: String },
  },
  { timestamps: true },
);

const ProgramModel =
  (mongoose.models.programs as Model<ProgramInterface>) ||
  mongoose.model<ProgramInterface>("programs", ProgramSchema);

const ClientModel =
  (mongoose.models.clients as Model<ClientInterface>) ||
  mongoose.model<ClientInterface>("clients", ClientSchema);

const NotificationModel =
  (mongoose.models.notifications as Model<NotificationInterface>) ||
  mongoose.model<NotificationInterface>("notifications", NotificationSchema);

const TestimonialModel =
  (mongoose.models.testimonials as Model<TestimonialInterface>) ||
  mongoose.model<TestimonialInterface>("testimonials", TestimonialSchema);

const SessionNoteModel =
  (mongoose.models.session_notes as Model<SessionNoteInterface>) ||
  mongoose.model<SessionNoteInterface>("session_notes", SessionNoteSchema);

export type {
  ClientInterface,
  NotificationInterface,
  ProgramInterface,
  SessionNoteInterface,
  TestimonialInterface,
};
export {
  ClientModel,
  NotificationModel,
  ProgramModel,
  SessionNoteModel,
  TestimonialModel,
};
