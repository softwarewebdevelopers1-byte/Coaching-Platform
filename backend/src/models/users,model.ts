import mongoose, { Model } from "mongoose";

interface UserAccountInterface {
  fullName: string;
  email: string;
  phone?: string;
  role: "admin" | "coach" | "user";
  status: "active" | "disabled";
  programName?: string;
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
