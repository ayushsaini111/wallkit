// utils/notifyFollowersAfterUpload.js
import Notification  from "@/models/notification.model.js";
import { User } from "@/models/user.model.js";
import mongoose from "mongoose";

/**
 * Notify all followers when a user uploads a wallpaper.
 * @param {String} uploaderId - The ID of the user who uploaded the wallpaper
 * @param {String} wallpaperId - The ID of the uploaded wallpaper
 */
export const notifyFollowersAfterUpload = async (uploaderId, wallpaperId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(uploaderId) || !mongoose.Types.ObjectId.isValid(wallpaperId)) {
      throw new Error("Invalid uploaderId or wallpaperId");
    }

    // Find uploader with followers
    const uploader = await User.findById(uploaderId).select("followers username");
    if (!uploader) {
      console.log("Uploader not found");
      return;
    }

    // If no followers, skip
    if (!uploader.followers || uploader.followers.length === 0) {
      console.log("No followers to notify");
      return;
    }

    // Create notifications for all followers
    const notifications = uploader.followers.map((followerId) => ({
      recipient: followerId,
      sender: uploaderId,
      type: "new_upload",
      wallpaper: wallpaperId,
      message: `${uploader.username} uploaded a new wallpaper.`,
    }));

    // Insert all notifications at once
    await Notification.insertMany(notifications);

    console.log(`✅ Notifications sent to ${uploader.followers.length} followers`);
  } catch (error) {
    console.error("Error notifying followers:", error.message);
  }
};
