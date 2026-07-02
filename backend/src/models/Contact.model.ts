import mongoose, { Model } from "mongoose";
import type { ContactLeadStatus } from "../utils/contactLeads.js";

interface ContactSubmissionInterface {
  name: string;
  email: string;
  phone: string;
  interest: "Individual Executive Coaching" | "Group Executive Coaching" | "Both" | string;
  goals: string;
  source?: string;
  status: ContactLeadStatus;
  programSlug?: string | null;
  assignedCoachId?: string;
  assignedCoachName?: string;
  bookingSessionId?: string;
  adminNotes?: string;
  contactedAt?: Date;
  scheduledAt?: Date;
}

const ContactSubmissionSchema = new mongoose.Schema<ContactSubmissionInterface>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true },
    interest: { type: String, required: true, trim: true, index: true },
    goals: { type: String, required: true, trim: true },
    source: { type: String, default: "website" },
    status: {
      type: String,
      enum: ["new", "contacted", "scheduled", "converted", "closed"],
      default: "new",
      index: true,
    },
    programSlug: { type: String, default: null },
    assignedCoachId: { type: String, default: null },
    assignedCoachName: { type: String, default: null },
    bookingSessionId: { type: String, default: null },
    adminNotes: { type: String, default: "" },
    contactedAt: { type: Date, default: null },
    scheduledAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const ContactSubmissionModel =
  (mongoose.models.contact_submissions as Model<ContactSubmissionInterface>) ||
  mongoose.model<ContactSubmissionInterface>("contact_submissions", ContactSubmissionSchema);

export type { ContactSubmissionInterface };
export { ContactSubmissionModel };
