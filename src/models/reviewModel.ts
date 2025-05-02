import { Document, Model, model, Schema, Types } from "mongoose";
import Hotel from "./hotelModel";

interface IReview extends Document {
  hotel: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}
interface ReviewModel extends Model<IReview> {
  calcAverageRatings(hotelId: Types.ObjectId): Promise<void>;
}

const reviewSchema = new Schema({
  hotel: {
    type: Types.ObjectId,
    ref: "Hotel",
    required: [true, "Review must belong to a hotel"],
  },
  user: {
    type: Types.ObjectId,
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

interface IReviewStatic {
  _id: Types.ObjectId;
  nRating: number;
  avgRating: number;
}
reviewSchema.statics.calcAverageRatings = async function (
  hotelId: Types.ObjectId
) {
  const stats: IReviewStatic[] = await this.aggregate([
    { $match: { hotel: hotelId } },
    {
      $group: {
        _id: "$hotel",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Hotel.findByIdAndUpdate(hotelId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Hotel.findByIdAndUpdate(hotelId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};
reviewSchema.index({ hotel: 1, user: 1 }, { unique: true });
reviewSchema.post("save", function () {
  (this.constructor as ReviewModel).calcAverageRatings((this as IReview).hotel);
});

reviewSchema.post(/^findOneAnd/, async function (docs: IReview) {
  if (docs) {
    await (docs.constructor as ReviewModel).calcAverageRatings(docs.hotel);
  }
});
const Review = model<IReview, ReviewModel>("Review", reviewSchema);

export default Review;
