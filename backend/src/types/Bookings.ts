interface BookingsInterface {
  imageUrl?: string;
  userId?: string;
  coachId: string;
  coachName: string;
  coachEmail?: string;
  programName: string;
  title: string;
  bookingDate: Date;
  bookingEndDate: Date;
  status: "open" | "booked" | "cancelled";
}
interface BookingsSessionsInterface {
  coachId: string;
  coachName?: string;
  coachEmail?: string;
  coachPhone?: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  country?: string;
  goals?: string[];
  coachingType?: string;
  programName: string;
  bookingTime: string;
  status?: "pending" | "approved" | "rejected" | "rescheduled" | "cancelled";
}
export type { BookingsInterface, BookingsSessionsInterface };
