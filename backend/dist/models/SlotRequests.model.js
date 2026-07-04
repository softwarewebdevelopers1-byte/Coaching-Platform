import mongoose from "mongoose";
const SlotRequestSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    programName: { type: String, required: true },
    coachId: { type: String, required: true },
    coachName: { type: String, required: true },
    coachEmail: { type: String, required: true },
    message: { type: String, required: false },
    status: {
        type: String,
        enum: ["pending", "approved", "declined"],
        default: "pending",
    },
    scheduledTime: { type: String, required: false },
    coachNotes: { type: String, required: false },
}, { timestamps: true });
const SlotRequestModel = mongoose.models.slot_requests ||
    mongoose.model("slot_requests", SlotRequestSchema);
export { SlotRequestModel };
//# sourceMappingURL=SlotRequests.model.js.map