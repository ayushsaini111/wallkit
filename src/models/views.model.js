// models/view.model.js
import mongoose from 'mongoose';

const viewSchema = new mongoose.Schema(
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

export const View =
  mongoose.models.View || mongoose.model('Views', viewSchema);
