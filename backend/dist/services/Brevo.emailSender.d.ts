interface BookingConfirmationDetails {
    email: string;
    fullName: string;
    phoneNumber: string;
    programName: string;
    coachId: string;
    coachName?: string;
    coachEmail?: string;
    coachPhone?: string;
    bookingTime: string;
}
export declare function sendBookingConfirmationEmail(booking: BookingConfirmationDetails): Promise<void>;
interface ContactAcknowledgmentDetails {
    email: string;
    name: string;
    interest: string;
}
export declare function sendContactAcknowledgmentEmail(details: ContactAcknowledgmentDetails): Promise<void>;
interface SlotRequestReceivedDetails {
    email: string;
    fullName: string;
    programName: string;
    coachName: string;
    coachEmail: string;
}
export declare function sendSlotRequestReceivedEmail(details: SlotRequestReceivedDetails): Promise<void>;
interface SlotRequestApprovedDetails {
    email: string;
    fullName: string;
    programName: string;
    coachName: string;
    coachEmail: string;
    coachPhone?: string;
    scheduledTime: string;
    coachNotes?: string;
}
export declare function sendSlotRequestApprovedEmail(details: SlotRequestApprovedDetails): Promise<void>;
interface SlotRequestDeclinedDetails {
    email: string;
    fullName: string;
    programName: string;
    coachName: string;
    coachEmail: string;
}
export declare function sendSlotRequestDeclinedEmail(details: SlotRequestDeclinedDetails): Promise<void>;
interface SlotRequestCoachNotificationDetails {
    coachEmail: string;
    coachName: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    programName: string;
    message: string;
}
export declare function sendSlotRequestCoachNotificationEmail(details: SlotRequestCoachNotificationDetails): Promise<void>;
interface ResetPasswordDetails {
    email: string;
    fullName: string;
    resetLink: string;
}
export declare function sendResetPasswordEmail(details: ResetPasswordDetails): Promise<void>;
export {};
//# sourceMappingURL=Brevo.emailSender.d.ts.map