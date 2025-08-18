import dbConnect from '@/lib/dbConnect';
import { View } from '@/models/views.model';
import { Wallpaper } from '@/models/wallpaper.model';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

export const POST = async (req) => {
  try {
    await dbConnect();

    const { wallpaperId } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(wallpaperId)) {
      return Response.json(
        { success: false, message: 'Invalid wallpaper ID' },
        { status: 400 }
      );
    }

    // Get logged-in user (optional)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    // Prevent duplicate view count per user per wallpaper
    if (userId) {
      const existingView = await View.findOne({ user: userId, wallpaper: wallpaperId });
      if (!existingView) {
        await View.create({ user: userId, wallpaper: wallpaperId });
      }
    } else {
      // For guests, you could still log a view without user ID
      await View.create({ wallpaper: wallpaperId });
    }

    return Response.json({ success: true, message: 'View recorded' });
  } catch (error) {
    console.error('Error recording view:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};
