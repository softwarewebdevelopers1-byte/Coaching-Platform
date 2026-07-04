import mongoose from "mongoose";
const UserAccountSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false },
    password: { type: String, required: false },
    role: {
        type: String,
        enum: ["admin", "coach", "user"],
        default: "user",
    },
    status: {
        type: String,
        enum: ["active", "disabled"],
        default: "active",
    },
    programName: { type: String, required: false },
    bio: { type: String, required: false },
    experience: { type: Number, required: false, default: 0 },
    languages: [{ type: String }],
    expertise: [{ type: String }],
    photo: { type: String, required: false },
    availabilitySummary: { type: String, required: false },
    currentWorkload: { type: Number, default: 0 },
    maxWorkload: { type: Number, default: 10 },
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpires: { type: Date, required: false },
    availabilityType: {
        type: String,
        enum: ["whole_week", "selected_days"],
        default: "whole_week",
    },
    availableDays: [{ type: String }],
}, { timestamps: true });
const CoachInviteSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    createdBy: { type: String, required: false },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });
const UserAccountModel = mongoose.models.user_accounts ||
    mongoose.model("user_accounts", UserAccountSchema);
const CoachInviteModel = mongoose.models.coach_invites ||
    mongoose.model("coach_invites", CoachInviteSchema);
export { UserAccountModel as UserAccountsModel, CoachInviteModel, };
//# sourceMappingURL=users.model.js.map