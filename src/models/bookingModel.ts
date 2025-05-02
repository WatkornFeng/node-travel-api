import { model, Schema, Types } from "mongoose";
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
  isPaid: {
    type: Boolean,
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

const Booking = model("Booking", bookingSchema);

export default Booking;
