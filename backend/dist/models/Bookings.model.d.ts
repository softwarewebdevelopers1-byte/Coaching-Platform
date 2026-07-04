import mongoose from "mongoose";
import type { BookingsInterface, BookingsSessionsInterface } from "../types/Bookings.js";
declare let BookingsCreatedModel: mongoose.Model<BookingsInterface, {}, {}, {}, mongoose.Document<unknown, {}, BookingsInterface, {}, mongoose.DefaultSchemaOptions> & BookingsInterface & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, BookingsInterface>;
declare let BookingsSessionsModel: mongoose.Model<BookingsSessionsInterface, {}, {}, {}, mongoose.Document<unknown, {}, BookingsSessionsInterface, {}, mongoose.DefaultSchemaOptions> & BookingsSessionsInterface & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, BookingsSessionsInterface>;
export { BookingsCreatedModel, BookingsSessionsModel };
//# sourceMappingURL=Bookings.model.d.ts.map