import mongoose from "mongoose";

const propertyTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "PropertyType must have name"],
  },
  svg: {
    type: String,
    trim: true,
    required: [true, "PropertyType must have svg file"],
  },
});

const PropertyType = mongoose.model("PropertyType", propertyTypeSchema);

export default PropertyType;
