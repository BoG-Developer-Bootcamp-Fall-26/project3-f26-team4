import mongoose from "mongoose";

const AnimalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide animal name."],
      trim: true,
    },
    breed: {
      type: String,
      required: [true, "Please provide breed."],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide owner user ID."],
    },
    hoursTrained: {
      type: Number,
      default: 0,
    },
    profilePicture: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Animal || mongoose.model("Animal", AnimalSchema);
