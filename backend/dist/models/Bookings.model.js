import mongoose from "mongoose";
// bookings created by coach
let BookingsCreatedByCoach = new mongoose.Schema({
    imageUrl: { type: String, required: false },
    userId: { type: String, required: false },
    coachId: { type: String, required: true, index: true },
    coachName: { type: String, required: true },
    coachEmail: { type: String, required: false, index: true },
    programName: { type: String, required: true, index: true },
    title: { type: String, required: true },
    bookingDate: { type: Date, required: true, index: true },
    bookingEndDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ["open", "booked", "cancelled"],
        default: "open",
        index: true,
    },
}, { timestamps: true });
BookingsCreatedByCoach.index({ coachId: 1, bookingDate: 1 }, { unique: true });
// bookings sessions made by users
let BookingsSessions = new mongoose.Schema({
    coachId: { type: String, required: true, index: true },
    coachName: { type: String, required: false },
    coachEmail: { type: String, required: false },
    coachPhone: { type: String, required: false },
    email: { type: String, required: true, index: true },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    country: { type: String, required: false },
    goals: [{ type: String }],
    coachingType: { type: String, required: false },
    programName: { type: String, required: true, index: true },
    bookingTime: { type: String, required: true },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "rescheduled", "cancelled"],
        default: "pending",
    },
}, { timestamps: true });
// models
let BookingsCreatedModel = mongoose.models.coach_bookings ||
    mongoose.model("coach_bookings", BookingsCreatedByCoach);
//
let BookingsSessionsModel = mongoose.models.booking_sessions ||
    mongoose.model("booking_sessions", BookingsSessions);
export { BookingsCreatedModel, BookingsSessionsModel };
//# sourceMappingURL=Bookings.model.js.map