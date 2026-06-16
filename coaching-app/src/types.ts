// types.ts
export interface Program {
  id: string;
  title: string;
  tag: string;
  description: string;
  duration: string;
  image: string;
  color: string;
}

export interface Coach {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  rating: number;
  bio: string;
  tags: string[];
}

export interface Testimonial {
  text: string;
  name: string;
  role: string;
  rating: number;
}

export interface Booking {
  id: number;
  name: string;
  email: string;
  program: string;
  coach: string;
  coachEmail: string;
  coachPhone: string;
  slot: string;
  duration: string;
  bookedAt: string;
}

export interface Account {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "admin" | "coach" | "user";
  status: "active" | "disabled";
  programName?: string;
}

export interface CoachSlot {
  _id: string;
  coachId: string;
  coachName: string;
  coachEmail?: string;
  programName: string;
  title: string;
  bookingDate: string;
  bookingEndDate: string;
  status: "open" | "booked" | "cancelled";
}

export interface BookingSession {
  _id: string;
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
