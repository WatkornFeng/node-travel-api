import mongoose from "mongoose";
import slugify from "slug";
import { thaiProvinces } from "../utils/dataForValidation";
const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hotel must have name"],
      trim: true,
      // unique: true,
      maxlength: [
        40,
        "A hotel name myst have less or equal than 40 characters",
      ],
      minlength: [1, "A hotel name myst have more or equal than 1 characters"],
    },
    description: {
      type: String,
      required: [true, "Hotel must have description"],
      trim: true,
      maxlength: [
        500,
        "A hotel description must have less or equal than 500 characters",
      ],
      minlength: [
        1,
        "A hotel description must have more or equal than 1 characters",
      ],
    },
    slug: String,
    image: [
      {
        type: String,
        required: true,
      },
    ],
    star: {
      type: Number,
      required: [true, "Hotel must have stars"],
      min: [1, "Star must be greater or equal than 1"],
      max: [5, "Star must be below or equal than 5"],
    },
    rating: {
      //***ทำเป็น ตาราง แยกไว้*/
      type: Number,
      required: [true, "rating must have rating"],
      min: [1, "Rating must be greater than 1"],
      max: [10, "Rating must be below than 10"],
    },
    price: {
      type: Number,
      required: [true, "Hotel must have price"],
      min: [10, "price must be greater than 10 dollars"],
      max: [10000, "price must be below than 10000 dollars"],
    },
    property: {
      //***ทำเป็น ตาราง แยกไว้*/
      type: String,
      required: [true, "Hotel must have property type"],
    },
    // location: {
    //   //***ทำเป็น ตาราง แยกไว้*/
    //   type: String,
    //   required: [true, "Hotel must have location"],
    //   enum: {
    //     values: thaiProvinces,
    //     message: "Location must be Thailand province",
    //   },
    // },
    province: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Province",
      required: [true, "Hotel must have province"],
    },
    //***ทำเป็น ตาราง แยกไว้*/
    facilities: [
      {
        type: String,
      },
    ],
  },
  { strictQuery: true, toJSON: { virtuals: true }, id: false }
);
hotelSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// hotelSchema.virtual("priceInUsDollar").get(function () {
//   return this.price / 35;
// });
hotelSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "hotel",
  localField: "_id",
});
const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
