import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    avatar: {
      type: String,
      required: function () {
        return this.provider === 'google';
      },
      default: '/avatar.png',
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    provider: {
      type: String,
      enum: ['google', 'local'],
      default: 'local',
      index: true
    },
    password: {
      type: String,
      required: function () {
        return this.provider === 'local';
      },
      minlength: [6, 'Password must be at least 6 characters long']
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
   
  },
  {
    timestamps: true,
    // Add indexes for better performance
    indexes: [
      { username: 1 },
      { email: 1 },
      { provider: 1 },
      { createdAt: -1 }
    ]
  }
);

// Middleware to update lastLoginAt on save
userSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastLoginAt = new Date();
  }
  next();
});

// Virtual for user's full profile URL (if needed)
userSchema.virtual('profileUrl').get(function() {
  return `/profile/${this.username}`;
});

// Method to get safe user data (without password)
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Static method to find user by email or username
userSchema.statics.findByIdentifier = function(identifier) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const query = emailRegex.test(identifier) 
    ? { email: identifier.toLowerCase() } 
    : { username: identifier.toLowerCase() };
  return this.findOne(query);
};

// Ensure indexes are created
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);