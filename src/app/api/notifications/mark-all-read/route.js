// File: /api/notifications/mark-all-read/route.js
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import Notification from '@/models/notification.model';
import connectToDB from '@/lib/dbConnect';
import { authOptions } from '@/lib/auth';

export async function PATCH(req) {
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

    console.log('Marking all notifications as read for user:', recipientId);

    // Update all unread notifications for this user
    const result = await Notification.updateMany(
      {
        recipient: recipientId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    console.log('Marked notifications as read:', result.modifiedCount);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully marked ${result.modifiedCount} notifications as read`,
        modifiedCount: result.modifiedCount
      }), 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}