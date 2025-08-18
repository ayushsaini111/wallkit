import mongoose from 'mongoose';

const wallpaperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader (user) is required'],
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    category: {
    type: String,
    enum: [
      'Nature',
      'Abstract',
      'Minimalist',
      'Animals',
      'Cityscape',
      'Space',
      'Technology',
      'Fantasy',
      'Textures & Patterns',
      'Food & Drinks',
      'People',
      'Architecture',
      'Cars & Vehicles',
      'Art & Illustration',
      '3D Renders',
      'Typography',
      'Dark',
      'Light',
      'Vintage',
      'Sports',
      'Other'
    ],
    required: true
  },
    downloadCount: {
      type: Number,
      default: 0,
    },
    appwriteId: {
      type: String,
      required: [true, 'Appwrite ID is required'],
    },

  },
  {
    timestamps: true,
  }
);

// Ensure single model definition during hot reloads
export const Wallpaper =
  mongoose.models.Wallpaper || mongoose.model('Wallpaper', wallpaperSchema);
