import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Room must have name"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Room must have price"],
    },

    facilities: [
      {
        type: String,
      },
    ],
  },
  { strictQuery: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
