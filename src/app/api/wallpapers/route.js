import dbConnect from '@/lib/dbConnect';
import { Wallpaper } from '@/models/wallpaper.model';
import mongoose from 'mongoose';

export const GET = async () => {
  try {
    await dbConnect();

    const wallpapers = await Wallpaper.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'uploadedBy',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },

      // Lookup Likes
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'wallpaper',
          as: 'likes'
        }
      },

      // Lookup Views
      {
        $lookup: {
          from: 'views',
          localField: '_id',
          foreignField: 'wallpaper',
          as: 'views'
        }
      },

      // Lookup Downloads
      {
        $lookup: {
          from: 'downloads',
          localField: '_id',
          foreignField: 'wallpaper',
          as: 'downloads'
        }
      },

      // Lookup Followers of the uploader
      {
        $lookup: {
          from: 'follows',
          localField: 'uploadedBy',
          foreignField: 'following',
          as: 'followers'
        }
      },

      // Final projection with counts
      {
        $project: {
          _id: 1,
          title: 1,
          description:1,
          imageUrl: 1,
          tags: 1,
          createdAt: 1,
          isPrivate: 1,
          'userDetails.username': 1,
          'userDetails.avatar': 1,
          'userDetails._id': 1,
          likeCount: { $size: '$likes' },
          viewCount: { $size: '$views' },
          downloadCount: { $size: '$downloads' },
          followerCount: { $size: '$followers' }
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return Response.json({ success: true, wallpapers });
  } catch (error) {
    console.error('Failed to get wallpapers:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};
