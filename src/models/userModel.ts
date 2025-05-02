import mongoose from "mongoose";
import validator from "validator";
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please tell us your email!"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
      maxlength: [30, "A email name must have less or equal than 30 chars"],
      minlength: [16, "A email name must have more or equal than 16 chars"],
    },
    name: {
      type: String,
      required: [true, "Please tell us your name!"],
      maxlength: [50, "A name must have less or equal than 50 chars"],
    },
    locale: {
      type: String,
      maxlength: 2,
    },
  },
  { toJSON: { virtuals: true }, id: false }
);

userSchema.virtual("property", {
  ref: "Hotel",
  localField: "_id",
  foreignField: "ownerProperty",
});
const User = mongoose.model("User", userSchema);

export default User;
