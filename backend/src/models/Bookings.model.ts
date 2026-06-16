import mongoose, { Model } from "mongoose";
import type {
  BookingsInterface,
  BookingsSessionsInterface,
} from "../types/Bookings.js";

// bookings created by coach
let BookingsCreatedByCoach = new mongoose.Schema<BookingsInterface>({
  imageUrl: { type: String, required: false },
  userId: { type: String, required: true },
  bookingDate: { type: Date, required: true },
  bookingEndDate: { type: Date, required: true },
});
// bookings sessions made by users
let BookingsSessions = new mongoose.Schema<BookingsSessionsInterface>({
  coachId: { type: String, required: true },
  email: { type: String, required: true },
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  programName: { type: String, required: true },
  bookingTime: { type: Date, required: true },
});
// models
let BookingsCreatedModel =
  mongoose.model<BookingsInterface>("coach_bookings", BookingsCreatedByCoach) ||
  (mongoose.models.coach_bookings as Model<BookingsInterface>);
//
let BookingsSessionsModel =
  mongoose.model<BookingsSessionsInterface>(
    "booking_sessions",
    BookingsSessions,
  ) || (mongoose.models.booking_sessions as Model<BookingsSessionsInterface>);
export { BookingsCreatedModel, BookingsSessionsModel };
