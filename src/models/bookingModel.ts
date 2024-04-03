import { Document, Model, model, Schema, Types } from "mongoose";
const bookingSchema = new Schema({
  hotel: {
    type: Types.ObjectId,
    ref: "Hotel",
    required: [true, "Booking must belong to a hotel"],
  },
  user: {
    type: Types.ObjectId,
    ref: "User",
    required: [true, "Booking must belong to a user"],
  },
  price: {
    type: Number,
    required: [true, "Booking must have a price"],
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
});
// bookingSchema.pre(/^find/, function (next) {
//   (this as any).populate("user").populate({
//     path: "hotel",
//     select: "name",
//   });
//   next();
// });
const Booking = model("Booking", bookingSchema);

export default Booking;
