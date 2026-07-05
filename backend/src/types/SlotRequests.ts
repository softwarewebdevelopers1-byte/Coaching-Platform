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
  requestedDate?: string;
  requestedTime?: string;
  googleMeetingLink?: string;
}

export type { SlotRequestInterface };
