export interface Program {
  id: string;
  title: string;
  tag: string;
  description: string;
  duration: string;
  image: string;
  color: string;
  benefits?: string[];
  outcomes?: string[];
}

export interface Coach {
  _id: string;
  id?: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience?: number;
  rating?: number;
  bio?: string;
  tags?: string[];
  status?: string;
  photo?: string;
  languages?: string[];
  availabilitySummary?: string;
  currentWorkload?: number;
  maxWorkload?: number;
  expertise?: string[];
  availabilityType?: "whole_week" | "selected_days";
  availableDays?: string[];
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
  bio?: string;
  experience?: number;
  languages?: string[];
  expertise?: string[];
  photo?: string;
  currentWorkload?: number;
  maxWorkload?: number;
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
  country?: string;
  goals?: string[];
  coachingType?: string;
  programName: string;
  bookingTime: string;
  status?: "pending" | "approved" | "rejected" | "rescheduled" | "cancelled";
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

export type ContactLeadStatus =
  | "new"
  | "contacted"
  | "scheduled"
  | "converted"
  | "closed";

export interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  goals: string;
  source?: string;
  status: ContactLeadStatus;
  programSlug?: string | null;
  assignedCoachId?: string;
  assignedCoachName?: string;
  bookingSessionId?: string;
  adminNotes?: string;
  contactedAt?: string;
  scheduledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformAnalytics {
  coaches: number;
  activeCoaches: number;
  bookings: number;
  openSlots: number;
  bookedSlots: number;
  notifications: number;
  contactLeads: number;
  leadsByStatus: Record<ContactLeadStatus, number>;
  leadsByInterest: {
    individual: number;
    group: number;
    both: number;
  };
  leadToBookingConversionRate: number;
  generatedAt: string;
}
