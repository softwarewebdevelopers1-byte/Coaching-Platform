import mongoose from "mongoose";
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
    availabilityType?: "whole_week" | "selected_days";
    availableDays?: string[];
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    currentWorkload?: number;
    maxWorkload?: number;
}
interface CoachInviteInterface {
    token: string;
    email: string;
    createdBy?: string;
    used: boolean;
    expiresAt: Date;
}
declare const UserAccountModel: mongoose.Model<UserAccountInterface, {}, {}, {}, mongoose.Document<unknown, {}, UserAccountInterface, {}, mongoose.DefaultSchemaOptions> & UserAccountInterface & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, UserAccountInterface>;
declare const CoachInviteModel: mongoose.Model<CoachInviteInterface, {}, {}, {}, mongoose.Document<unknown, {}, CoachInviteInterface, {}, mongoose.DefaultSchemaOptions> & CoachInviteInterface & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, CoachInviteInterface>;
export type { UserAccountInterface, CoachInviteInterface };
export { UserAccountModel as UserAccountsModel, CoachInviteModel, };
//# sourceMappingURL=users.model.d.ts.map