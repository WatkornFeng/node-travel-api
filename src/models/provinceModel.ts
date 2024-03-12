import mongoose from "mongoose";
import { thaiProvinces } from "../utils/dataForValidation";
const provinceSchema = new mongoose.Schema({
  name: {
    type: "string",
    require: [true, "Province must have name"],
    unique: true,
    enum: {
      values: thaiProvinces,
      message: "Location must be Thailand province",
    },
  },
  picture: {
    url: {
      type: "string",
      require: [true, "Picture must have picture's url"],
    },
    cloudinary_id: {
      type: "string",
      require: [true, "Picture must have id"],
    },
  },
  pictureCover: {
    url: {
      type: "string",
      require: [true, "PictureCover must have picture's url"],
    },
    cloudinary_id: {
      type: "string",
      require: [true, "PictureCover must have id"],
    },
  },
});

const Province = mongoose.model("Province", provinceSchema);

export default Province;
