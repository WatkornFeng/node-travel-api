import mongoose from "mongoose";
import { Document, Types } from "mongoose";
import slugify from "slug";

export interface IHotel extends Document {
  name: string;
  description: string;
  slug: string;
  images: string[];
  stars: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  propertyType: Types.ObjectId;
  province: Types.ObjectId;
  amenities: Types.ObjectId;
  ownerProperty: Types.ObjectId;
  guestsQuantity: number;
  bedsQuantity: number;
}
const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hotel must have name"],
      trim: true,
      maxlength: [
        40,
        "A hotel name must have less or equal than 40 characters",
      ],
      minlength: [1, "A hotel name must have more or equal than 1 characters"],
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
    location: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    slug: String,
    images: [
      {
        url: {
          type: "string",
          required: [true, "Hotel's images must have picture's url"],
        },
        cloudinary_id: {
          type: "string",
          required: [true, "Hotel's images must have cloundinary id"],
        },
      },
    ],
    stars: {
      type: Number,
      required: [true, "Hotel must have stars"],
      min: [1, "Star must be greater or equal than 1"],
      max: [5, "Star must be below or equal than 5"],
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
      set: (val: number) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Hotel must have price"],
      min: [10, "price must be greater than 10 dollars"],
      max: [10000, "price must be below than 10000 dollars"],
    },

    amenities: [{ type: Types.ObjectId, ref: "Amenity" }],
    propertyType: {
      type: Types.ObjectId,
      ref: "PropertyType",
      required: [true, "Hotel must have property type"],
    },
    province: {
      type: Types.ObjectId,
      ref: "Province",
      required: [true, "Hotel must have province"],
    },
    ownerProperty: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "Hotel must has the owner"],
    },
    guestsQuantity: {
      type: Number,
      required: [true, "Hotel must specify amount of guests"],
    },
    bedsQuantity: {
      type: Number,
      required: [true, "Hotel must specify amount of beds"],
    },
  },
  { strictQuery: true, toJSON: { virtuals: true }, id: false }
);

hotelSchema.index({ location: "2dsphere" });
hotelSchema.pre("save", function (next) {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true, trim: true });
  }
  next();
});
hotelSchema.pre(/^find/, function (next) {
  const update = (this as any).getUpdate();
  if (update && update.name) {
    update.slug = slugify(update.name, { lower: true, trim: true });
  }
  next();
});

hotelSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "hotel",
  localField: "_id",
});
const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
