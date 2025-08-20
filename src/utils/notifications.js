import mongoose from 'mongoose';
import {Follow} from '@/models/follow.model';       // adjust path as needed
import Notification from '@/models/notification.model';
import {Wallpaper} from '@/models/wallpaper.model';
import { transporter } from '@/lib/mailer';

// Function to notify followers by email and create notifications after wallpaper upload
export const notifyFollowersAfterUpload = async ({ wallpaperId }) => {
  try {
    // 1. Find wallpaper with uploader info
    const wallpaper = await Wallpaper.findById(wallpaperId).populate('uploadedBy', 'username' ,);
    if (!wallpaper) throw new Error('Wallpaper not found');
    
    
    const uploaderId = wallpaper.uploadedBy._id;
    const uploaderName = wallpaper.uploadedBy.username;
    console.log(`Uploader ID: ${uploaderId}, Uploader Name: ${uploaderName}`);

    // 2. Get followers emails and names with aggregation pipeline
    const followers = await Follow.aggregate([
    { $match: { following: new mongoose.Types.ObjectId(uploaderId) } },

      {
        $lookup: {
          from: 'users',
          localField: 'follower',
          foreignField: '_id',
          as: 'followerDetails',
        },
      },
      { $unwind: '$followerDetails' },
      {
        $project: {
          _id: 0,
          followerId: '$followerDetails._id',
          email: '$followerDetails.email',
          name: '$followerDetails.name',
        },
      },
    ]);

    if (followers.length === 0) {
      console.log('No followers to notify.');
      return;
    }

    // 3. Send emails & create notifications
    const emailPromises = followers.map(async ({ followerId, email, name }) => {
      // Create notification document
      await Notification.create({
        recipient: followerId,
        sender: uploaderId,
        wallpaper: wallpaper._id,
        type: 'new_wallpaper',
        link:`/?wallpaper=${wallpaper._id}`
      });
      console.log(`Notification created for follower ${followerId}`);

      // Send notification email
      return transporter.sendMail({
        from: `"WallKit" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `${uploaderName} uploaded a new wallpaper! 🎨`,
        html: `
          <h2>Hi ${name || 'there'},</h2>
          <p>${uploaderName} has uploaded a new wallpaper titled "<strong>${wallpaper.title}</strong>" on WallKit.</p>
          <p>Check it out <a href="http://localhost:3000/?wallpaper=${wallpaper._id}">here</a> and enjoy the art!</p>
          <br/>
          <p>Best regards,<br/>The WallKit Team</p>
        `,
      });
    });

    await Promise.all(emailPromises);
    console.log(`✅ Sent notifications and emails to ${followers.length} followers.`);
  } catch (error) {
    console.error('❌ Error notifying followers:', error.message);
  }
};
