import mongoose from "mongoose";
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
declare const ContactSubmissionModel: mongoose.Model<ContactSubmissionInterface, {}, {}, {}, mongoose.Document<unknown, {}, ContactSubmissionInterface, {}, mongoose.DefaultSchemaOptions> & ContactSubmissionInterface & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, ContactSubmissionInterface>;
export type { ContactSubmissionInterface };
export { ContactSubmissionModel };
//# sourceMappingURL=Contact.model.d.ts.map