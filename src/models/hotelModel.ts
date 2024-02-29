import mongoose from "mongoose";
import slugify from "slug";
import { thaiProvinces } from "../utils/dataForValidation";
const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hotel must have name"],
      trim: true,
      unique: true,
      maxlength: [
        40,
        "A hotel name myst have less or equal than 40 characters",
      ],
      minlength: [5, "A hotel name myst have more or equal than 10 characters"],
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
      min: [1, "price must be greater than 1 baht"],
      max: [30000, "price must be below than 30000 baht"],
    },
    property: {
      //***ทำเป็น ตาราง แยกไว้*/
      type: String,
      required: [true, "Hotel must have property"],
    },
    location: {
      //***ทำเป็น ตาราง แยกไว้*/
      type: String,
      required: [true, "Hotel must have location"],
      enum: {
        values: thaiProvinces,
        message: "Location must be Thailand province",
      },
    },
    //***ทำเป็น ตาราง แยกไว้*/
    facilities: [
      {
        type: String,
      },
    ],
    reviews: {
      type: Number,
    },
  },
  { strictQuery: true, toJSON: { virtuals: true }, id: false }
);
hotelSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
hotelSchema.virtual("priceInUsDollar").get(function () {
  return this.price / 35;
});
const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
