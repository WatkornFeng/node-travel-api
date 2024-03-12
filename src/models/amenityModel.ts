import mongoose from "mongoose";
// reviewText
// Excellent
// Good
// Okay
// Poor
// Terrible
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

const Amenity = mongoose.model("amenity", amenitySchema);

export default Amenity;
