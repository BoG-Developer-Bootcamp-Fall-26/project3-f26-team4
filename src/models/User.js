import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide full name."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide email."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide password."],
    },
    admin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
