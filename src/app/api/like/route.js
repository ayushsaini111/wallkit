import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { Like } from '@/models/like.model';
import { Wallpaper } from '@/models/wallpaper.model';

/**
 * Toggle like/unlike a wallpaper
 */
export async function POST(req) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // NextAuth usually provides `id`, but you stored `_id`. Adjust accordingly.
  const userId = session.user._id || session.user.id;
  const body = await req.json();
  const { wallpaperId } = body;

  try {
    // Check if already liked
    const existingLike = await Like.findOne({ user: userId, wallpaper: wallpaperId });

    if (existingLike) {
      // Unlike (remove the like)
      await Like.findByIdAndDelete(existingLike._id);
      console.log('[UNLIKED]', existingLike);
      return NextResponse.json({ message: 'Unliked successfully' }, { status: 200 });
    } else {
      // Like (create new)
      const newLike = await Like.create({ user: userId, wallpaper: wallpaperId });
      console.log('[LIKED]', newLike);
      return NextResponse.json({ message: 'Liked successfully', like: newLike }, { status: 201 });
    }
  } catch (error) {
    console.error('[LIKE ERROR]', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

/**
 * Get all liked wallpapers of the logged-in user
 */
export const GET = async () => {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user._id || session.user.id;

    const likedWallpapers = await Like.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },

      // Join with wallpapers
      {
        $lookup: {
          from: 'wallpapers',
          localField: 'wallpaper',
          foreignField: '_id',
          as: 'wallpaperDetails',
        },
      },
      { $unwind: '$wallpaperDetails' },

      // Join uploader info
      {
        $lookup: {
          from: 'users',
          localField: 'wallpaperDetails.uploadedBy',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },

      // Lookup likes count
      {
        $lookup: {
          from: 'likes',
          localField: 'wallpaperDetails._id',
          foreignField: 'wallpaper',
          as: 'likes',
        },
      },

      // Lookup views count
      {
        $lookup: {
          from: 'views',
          localField: 'wallpaperDetails._id',
          foreignField: 'wallpaper',
          as: 'views',
        },
      },

      // Lookup downloads count
      {
        $lookup: {
          from: 'downloads',
          localField: 'wallpaperDetails._id',
          foreignField: 'wallpaper',
          as: 'downloads',
        },
      },

      // Lookup followers of uploader
      {
        $lookup: {
          from: 'follows',
          localField: 'wallpaperDetails.uploadedBy',
          foreignField: 'following',
          as: 'followers',
        },
      },

      // Final projection
      {
        $project: {
          _id: '$wallpaperDetails._id',
          title: '$wallpaperDetails.title',
          description: '$wallpaperDetails.description',
          imageUrl: '$wallpaperDetails.imageUrl',
          tags: '$wallpaperDetails.tags',
          createdAt: '$wallpaperDetails.createdAt',
          'userDetails.username': 1,
          'userDetails.avatar': 1,
          'userDetails._id': 1,
          likeCount: { $size: '$likes' },
          viewCount: { $size: '$views' },
          downloadCount: { $size: '$downloads' },
          followerCount: { $size: '$followers' },
          isLiked: { $literal: true }, // since this route is only for liked wallpapers
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return NextResponse.json({ success: true, wallpapers: likedWallpapers });
  } catch (error) {
    console.error('[LIKED_WALLPAPERS_ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};
