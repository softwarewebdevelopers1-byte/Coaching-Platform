interface BookingsInterface {
  imageUrl?: string;
  userId: string;
  bookingDate: Date;
  bookingEndDate: Date;
}
interface BookingsSessionsInterface {
  coachId: string;
  coachName?: string;
  coachEmail?: string;
  coachPhone?: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  programName: string;
  bookingTime: string;
}
export type { BookingsInterface, BookingsSessionsInterface };
