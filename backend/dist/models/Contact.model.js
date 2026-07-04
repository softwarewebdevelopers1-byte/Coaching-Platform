import mongoose from "mongoose";
const ContactSubmissionSchema = new mongoose.Schema({
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
}, { timestamps: true });
const ContactSubmissionModel = mongoose.models.contact_submissions ||
    mongoose.model("contact_submissions", ContactSubmissionSchema);
export { ContactSubmissionModel };
//# sourceMappingURL=Contact.model.js.map