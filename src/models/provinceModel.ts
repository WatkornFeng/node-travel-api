import mongoose from "mongoose";
import { thaiProvinces } from "../utils/dataForValidation";
const provinceSchema = new mongoose.Schema({
  name: {
    type: "string",
    require: [true, "Province must have name"],
    enum: {
      values: thaiProvinces,
      message: "Location must be Thailand province",
    },
  },
});

const Province = mongoose.model("Province", provinceSchema);

export default Province;
