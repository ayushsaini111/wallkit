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
      required: [true, 'Original image URL is required'],
    },
    compressedUrl: {
      type: String,
      default: null, // Cloudinary compressed version
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
        'Other',
      ],
      required: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    appwriteId: {
      type: String,
      default: null, // Only required if >10MB (stored in Appwrite)
    },
  },
  {
    timestamps: true,
  }
);

export const Wallpaper =
  mongoose.models.Wallpaper || mongoose.model('Wallpaper', wallpaperSchema);
