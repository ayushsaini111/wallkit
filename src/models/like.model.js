import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wallpaper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallpaper',
      required: true,
    },
  },
  { timestamps: true }
);

likeSchema.index({ user: 1, wallpaper: 1 }, { unique: true }); // One like per user per wallpaper

export const Like = mongoose.models.Like || mongoose.model('Like', likeSchema);
