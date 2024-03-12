import mongoose from "mongoose";
// reviewText
// Excellent
// Good
// Okay
// Poor
// Terrible
const reviewSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: [true, "Review must belong to a hotel"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Review must belong to a user"],
  },
  rating: {
    type: Number,
    required: [true, "Review must have rating"],
    enum: [2, 4, 6, 8, 10],
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [
      300,
      "A review's comment must have less or equal than 300 characters",
    ],
    minlength: [
      5,
      "A review's comment must have more or equal than 5 characters",
    ],
  },
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
