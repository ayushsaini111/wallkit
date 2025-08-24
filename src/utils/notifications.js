import mongoose from 'mongoose';
import {Follow} from '@/models/follow.model';       // adjust path as needed
import Notification from '@/models/notification.model';
import {Wallpaper} from '@/models/wallpaper.model';
import { transporter } from '@/lib/mailer';
// Function to notify followers by email and create notifications after wallpaper upload
export const notifyFollowersAfterUpload = async ({ wallpaperId }) => {
  try {
    // 1. Find wallpaper with uploader info
    const wallpaper = await Wallpaper.findById(wallpaperId).populate(
      'uploadedBy',
      'username'
    );
    if (!wallpaper) throw new Error('Wallpaper not found');

    const uploaderId = wallpaper.uploadedBy._id;
    const uploaderName = wallpaper.uploadedBy.username;
    console.log(`Uploader ID: ${uploaderId}, Uploader Name: ${uploaderName}`);

    // 2. Get followers emails, names, and emailNotifications preference
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
          emailNotifications: '$followerDetails.emailNotifications',
        },
      },
    ]);

    if (followers.length === 0) {
      console.log('No followers to notify.');
      return;
    }

    // 3. Send emails & create notifications ONLY if emailNotifications = true
    const emailPromises = followers.map(async ({ followerId, email, name, emailNotifications }) => {
      if (!emailNotifications) {
        console.log(`🔕 Skipped for ${followerId} (notifications disabled)`);
        return null;
      }

      // Create in-app notification
      await Notification.create({
        recipient: followerId,
        sender: uploaderId,
        wallpaper: wallpaper._id,
        type: 'new_wallpaper',
        link: `/?wallpaper=${wallpaper._id}`,
      });
      console.log(`🔔 Notification created for follower ${followerId}`);

      // Send email
      return transporter.sendMail({
      from: `"WallPickr" <${process.env.EMAIL_USER}>`, 
to: email, 
subject: `✨ ${uploaderName} just shared a new wallpaper on WallPickr!`, 
html: `
  <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; color: #111827;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 24px;">
      
      <h2 style="color: #2563eb; margin-bottom: 16px;">Hi ${name || 'there'} 👋</h2>

      <p style="font-size: 16px; line-height: 1.6; color: #374151;">
        <strong>${uploaderName}</strong> just uploaded a brand new wallpaper titled 
        <span style="color: #2563eb; font-weight: bold;">"${wallpaper.title}"</span> on <b>WallPickr</b>.
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-top: 12px;">
        Ready to give your screen a fresh look? 🎨✨
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${process.env.NEXTAUTH_URL}/?wallpaper=${wallpaper._id}" 
           style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; 
                  text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
          🔗 View Wallpaper
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;"/>

      <p style="font-size: 14px; color: #6b7280;">
        You’re receiving this email because you follow <strong>${uploaderName}</strong> on WallPickr.  
        Stay inspired with fresh wallpapers delivered to you. 💙
      </p>

      <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">
        Best regards,<br/>
        <strong>The WallPickr Team</strong>
      </p>
    </div>
  </div>
`

      });
    });

    await Promise.all(emailPromises);
    console.log(`✅ Processed notifications for ${followers.length} followers.`);
  } catch (error) {
    console.error('❌ Error notifying followers:', error.message);
  }
};
