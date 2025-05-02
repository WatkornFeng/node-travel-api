import { model, Schema, Types } from "mongoose";

const favoriteSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: "User",
    required: [true, "Favorite must belong to a user"],
  },
  hotel: {
    type: Types.ObjectId,
    ref: "Hotel",
    required: [true, "Favorite must belong to a hotel"],
  },
  createdAt: { type: Date, default: Date.now },
});

const Favorite = model("Favorite", favoriteSchema);

export default Favorite;
