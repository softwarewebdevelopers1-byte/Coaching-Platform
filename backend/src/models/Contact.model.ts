import mongoose, { Model } from "mongoose";

interface ContactSubmissionInterface {
  name: string;
  email: string;
  phone: string;
  interest: "Individual Executive Coaching" | "Group Executive Coaching" | "Both" | string;
  goals: string;
  source?: string;
}

const ContactSubmissionSchema = new mongoose.Schema<ContactSubmissionInterface>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true },
    interest: { type: String, required: true, trim: true },
    goals: { type: String, required: true, trim: true },
    source: { type: String, default: "website" },
  },
  { timestamps: true },
);

const ContactSubmissionModel =
  (mongoose.models.contact_submissions as Model<ContactSubmissionInterface>) ||
  mongoose.model<ContactSubmissionInterface>("contact_submissions", ContactSubmissionSchema);

export type { ContactSubmissionInterface };
export { ContactSubmissionModel };
