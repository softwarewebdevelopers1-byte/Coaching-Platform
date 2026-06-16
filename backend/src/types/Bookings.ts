interface BookingsInterface {
  imageUrl?: string;
  userId: string;
  bookingDate: Date;
  bookingEndDate: Date;
}
interface BookingsSessionsInterface {
  coachId: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  programName: string;
  bookingTime: Date;
}
export type { BookingsInterface, BookingsSessionsInterface };
