import mongoose from "mongoose";

const amenitySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "Amenity must have name"],
  },
  svg: {
    type: String,
    trim: true,
    required: [true, "Amenity must have svg file"],
  },
});

const Amenity = mongoose.model("Amenity", amenitySchema);

export default Amenity;
