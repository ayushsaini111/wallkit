import mongoose from 'mongoose';

const downloadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    wallpaper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallpaper',
      required: true,
    },
  },
  { timestamps: true }
);

export const Download =
  mongoose.models.Download || mongoose.model('Download', downloadSchema);
