import mongoose, { Model } from "mongoose";

interface UserAccountInterface {
  fullName: string;
  email: string;
  phone?: string;
  role: "admin" | "coach" | "user";
  status: "active" | "disabled";
  programName?: string;
  password?: string;
  bio?: string;
  experience?: number;
  languages?: string[];
  expertise?: string[];
  photo?: string;
  availabilitySummary?: string;
  currentWorkload?: number;
  maxWorkload?: number;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  availabilityType?: "whole_week" | "selected_days";
  availableDays?: string[];
}

interface CoachInviteInterface {
  token: string;
  email: string;
  createdBy?: string;
  used: boolean;
  expiresAt: Date;
}

const UserAccountSchema = new mongoose.Schema<UserAccountInterface>(
  {
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
  },
  { timestamps: true },
);

const CoachInviteSchema = new mongoose.Schema<CoachInviteInterface>(
  {
    token: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    createdBy: { type: String, required: false },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

const UserAccountModel =
  (mongoose.models.user_accounts as Model<UserAccountInterface>) ||
  mongoose.model<UserAccountInterface>("user_accounts", UserAccountSchema);

const CoachInviteModel =
  (mongoose.models.coach_invites as Model<CoachInviteInterface>) ||
  mongoose.model<CoachInviteInterface>("coach_invites", CoachInviteSchema);

export type { UserAccountInterface, CoachInviteInterface };
export {
  UserAccountModel as UserAccountsModel,
  CoachInviteModel,
};
