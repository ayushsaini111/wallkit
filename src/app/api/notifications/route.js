// File: /api/notifications/route.js
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import Notification from '@/models/notification.model';
import connectToDB from '@/lib/dbConnect';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    await connectToDB();

    // Use _id instead of id (based on your session callback)
    const userId = session.user._id || session.user.id;
    console.log('Session user ID:', userId);
    console.log('Session user:', session.user);

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID not found in session' }), { status: 400 });
    }

    // Convert to ObjectId safely
    let recipientId;
    try {
      recipientId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      console.error('Invalid ObjectId:', userId);
      return new Response(JSON.stringify({ error: 'Invalid user ID' }), { status: 400 });
    }

    console.log('Looking for notifications for recipient:', recipientId);

    // Debug queries
    const totalNotifications = await Notification.countDocuments({});
    console.log('Total notifications in database:', totalNotifications);

    const userNotifications = await Notification.countDocuments({ recipient: recipientId });
    console.log('Notifications for this user:', userNotifications);

    const notifications = await Notification.aggregate([
      { $match: { recipient: recipientId } },
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'senderDetails',
        },
      },
      { $unwind: '$senderDetails' },
      {
        $lookup: {
          from: 'wallpapers',
          localField: 'wallpaper',
          foreignField: '_id',
          as: 'wallpaperDetails',
        },
      },
      { $unwind: { path: '$wallpaperDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          type: 1,
          isRead: 1,
          createdAt: 1,
          sender: {
            _id: '$senderDetails._id',
            username: '$senderDetails.username',
            avatar: '$senderDetails.avatar',
          },
          wallpaper: {
            _id: '$wallpaperDetails._id',
            title: '$wallpaperDetails.title',
            imageUrl: '$wallpaperDetails.imageUrl',
          },
          link: 1
        }
      }
    ]);

    // console.log('Final notifications result:', notifications);
    return new Response(JSON.stringify({ success: true, notifications }), { status: 200 });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    await connectToDB();

    const { id } = params;
    const userId = session.user._id || session.user.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID not found in session' }), { status: 400 });
    }

    console.log('Marking notification as read:', id, 'for user:', userId);

    // Validate notification ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "Invalid notification ID" }), { status: 400 });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        recipient: new mongoose.Types.ObjectId(userId)
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      console.log('Notification not found for ID:', id, 'and user:', userId);
      return new Response(JSON.stringify({ error: "Notification not found" }), { status: 404 });
    }

    console.log('Successfully marked notification as read:', notification._id);
    return new Response(JSON.stringify({ success: true, notification }), { status: 200 });
  } catch (error) {
    console.error("Error updating notification:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

// DELETE handler for deleting ALL notifications for the authenticated user
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    await connectToDB();

    const userId = session.user._id || session.user.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID not found in session' }), { status: 400 });
    }

    // Convert to ObjectId safely
    let recipientId;
    try {
      recipientId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      console.error('Invalid ObjectId:', userId);
      return new Response(JSON.stringify({ error: 'Invalid user ID' }), { status: 400 });
    }

    console.log('Deleting all notifications for user:', recipientId);

    // Delete all notifications for this user
    const result = await Notification.deleteMany({ recipient: recipientId });

    console.log('Deleted notifications count:', result.deletedCount);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully deleted ${result.deletedCount} notifications`,
        deletedCount: result.deletedCount
      }), 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}