import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      default: "My Collection",
      required: true,
    },
    wallpapers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Wallpaper",
      },
    ],
  },
  { timestamps: true }
);

export const Collection =
  mongoose.models.Collection || mongoose.model("Collection", CollectionSchema);
