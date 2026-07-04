interface SlotRequestInterface {
    fullName: string;
    email: string;
    phoneNumber: string;
    programName: string;
    coachId: string;
    coachName: string;
    coachEmail: string;
    message?: string;
    status: "pending" | "approved" | "declined";
    scheduledTime?: string;
    coachNotes?: string;
}
export type { SlotRequestInterface };
//# sourceMappingURL=SlotRequests.d.ts.map