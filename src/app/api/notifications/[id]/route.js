// File: /api/notifications/[id]/route.js
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import Notification from '@/models/notification.model';
import connectToDB from '@/lib/dbConnect';
import { authOptions } from '@/lib/auth';

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

// DELETE handler for deleting a specific notification
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    await connectToDB();

    const { id } = params;
    const userId = session.user._id || session.user.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID not found in session' }), { status: 400 });
    }

    console.log('Deleting notification:', id, 'for user:', userId);

    // Validate notification ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "Invalid notification ID" }), { status: 400 });
    }

    // Convert to ObjectId safely
    let recipientId;
    try {
      recipientId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      console.error('Invalid ObjectId:', userId);
      return new Response(JSON.stringify({ error: 'Invalid user ID' }), { status: 400 });
    }

    // Find and delete the notification (only if it belongs to the authenticated user)
    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: recipientId
    });

    if (!notification) {
      console.log('Notification not found for ID:', id, 'and user:', userId);
      return new Response(JSON.stringify({ error: "Notification not found or doesn't belong to you" }), { status: 404 });
    }

    console.log('Successfully deleted notification:', notification._id);
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification deleted successfully',
        deletedNotification: {
          _id: notification._id,
          type: notification.type
        }
      }), 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting notification:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}