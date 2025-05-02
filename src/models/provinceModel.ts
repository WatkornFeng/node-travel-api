import mongoose from "mongoose";
import { thaiProvinces } from "../utils/dataForValidation";
const provinceSchema = new mongoose.Schema({
  name: {
    type: "string",
    required: [true, "Province must have name"],
    unique: true,
    enum: {
      values: thaiProvinces,
      message: "Location must be Thailand province",
    },
  },
  picture: {
    url: {
      type: "string",
      required: [true, "Picture must have picture's url"],
    },
    cloudinary_id: {
      type: "string",
      required: [true, "Picture must have cloundinary id"],
    },
  },
  pictureCover: {
    url: {
      type: "string",
      required: [true, "PictureCover must have picture's url"],
    },
    cloudinary_id: {
      type: "string",
      required: [true, "PictureCover must have id"],
    },
  },
});

const Province = mongoose.model("Province", provinceSchema);

export default Province;
