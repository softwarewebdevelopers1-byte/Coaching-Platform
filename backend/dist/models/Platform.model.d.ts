import mongoose from "mongoose";
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
    type: "booking_confirmation" | "booking_approval" | "booking_rejection" | "session_reminder" | "reschedule_notice" | "contact_acknowledgment";
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
declare const ProgramModel: mongoose.Model<ProgramInterface, {}, {}, {}, mongoose.Document<unknown, {}, ProgramInterface, {}, mongoose.DefaultSchemaOptions> & ProgramInterface & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, ProgramInterface>;
declare const ClientModel: mongoose.Model<ClientInterface, {}, {}, {}, mongoose.Document<unknown, {}, ClientInterface, {}, mongoose.DefaultSchemaOptions> & ClientInterface & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, ClientInterface>;
declare const NotificationModel: mongoose.Model<NotificationInterface, {}, {}, {}, mongoose.Document<unknown, {}, NotificationInterface, {}, mongoose.DefaultSchemaOptions> & NotificationInterface & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, NotificationInterface>;
declare const TestimonialModel: mongoose.Model<TestimonialInterface, {}, {}, {}, mongoose.Document<unknown, {}, TestimonialInterface, {}, mongoose.DefaultSchemaOptions> & TestimonialInterface & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, TestimonialInterface>;
declare const SessionNoteModel: mongoose.Model<SessionNoteInterface, {}, {}, {}, mongoose.Document<unknown, {}, SessionNoteInterface, {}, mongoose.DefaultSchemaOptions> & SessionNoteInterface & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, SessionNoteInterface>;
interface AppNotificationInterface {
    recipientId: string;
    title: string;
    message: string;
    read: boolean;
    type: "contact_submission" | "slot_request" | "slot_booking";
    createdAt?: Date;
}
declare const AppNotificationModel: mongoose.Model<AppNotificationInterface, {}, {}, {}, mongoose.Document<unknown, {}, AppNotificationInterface, {}, mongoose.DefaultSchemaOptions> & AppNotificationInterface & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, AppNotificationInterface>;
export type { ClientInterface, NotificationInterface, ProgramInterface, SessionNoteInterface, TestimonialInterface, AppNotificationInterface, };
export { ClientModel, NotificationModel, ProgramModel, SessionNoteModel, TestimonialModel, AppNotificationModel, };
//# sourceMappingURL=Platform.model.d.ts.map