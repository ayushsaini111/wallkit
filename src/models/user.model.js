import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,  // ✅ already creates a unique index
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,  // ✅ same here
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    avatar: {
      type: String,
      required: function () {
        return this.provider === "google";
      },
      default: "/avatar.png",
    },
    bio: {
      type: String,
      default: "",
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    provider: {
      type: String,
      enum: ["google", "local"],
      default: "local",
      index: true, // ✅ keep index if you need queries by provider
    },
    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      minlength: [6, "Password must be at least 6 characters long"],
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// ✅ Add extra indexes ONLY if necessary
userSchema.index({ provider: 1 });
userSchema.index({ createdAt: -1 });

// Middleware: update lastLoginAt
userSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.lastLoginAt = new Date();
  }
  next();
});

// Virtual field
userSchema.virtual("profileUrl").get(function () {
  return `/profile/${this.username}`;
});

// Instance method
userSchema.methods.toSafeObject = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Static method
userSchema.statics.findByIdentifier = function (identifier) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const query = emailRegex.test(identifier)
    ? { email: identifier.toLowerCase() }
    : { username: identifier.toLowerCase() };
  return this.findOne(query);
};

export const User =
  mongoose.models.User || mongoose.model("User", userSchema);
