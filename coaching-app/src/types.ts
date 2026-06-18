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

// DB-backed coach (fetched from /api/accounts with role=coach)
export interface Coach {
  _id: string;        // MongoDB _id
  id?: number;        // legacy static id (unused for DB coaches)
  name: string;       // maps to fullName in DB
  email: string;
  phone: string;
  specialization: string;  // maps to programName in DB
  experience?: number;
  rating?: number;
  bio?: string;
  tags?: string[];
  status?: string;
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

export interface SlotRequest {
  _id: string;
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
  createdAt?: string;
}
