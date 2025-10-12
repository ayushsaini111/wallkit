import dbConnect from '@/lib/dbConnect';
import { Wallpaper } from '@/models/wallpaper.model';
import mongoose from 'mongoose';

export const GET = async () => {
  try {
    await dbConnect();

    const wallpapers = await Wallpaper.aggregate([
      // Lookup uploader details
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

      // Compute trending score
      {
        $addFields: {
          likeCount: { $size: '$likes' },
          viewCount: { $size: '$views' },
          downloadCount: { $size: '$downloads' },
          followerCount: { $size: '$followers' },
          trendingScore: {
            $add: [
              { $multiply: [{ $size: '$likes' }, 2] },       // likes weighted 2x
              { $multiply: [{ $size: '$views' }, 1] },       // views weighted 1x
              { $multiply: [{ $size: '$downloads' }, 3] }    // downloads weighted 3x
            ]
          }
        }
      },

      // Project only required fields
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          imageUrl: 1,
          tags: 1,
          createdAt: 1,
          'userDetails.username': 1,
          'userDetails.avatar': 1,
          'userDetails._id': 1,
          likeCount: 1,
          viewCount: 1,
          downloadCount: 1,
          followerCount: 1,
          trendingScore: 1
        }
      },

      // Sort by trending score descending
      { $sort: { trendingScore: -1, createdAt: -1 } },
    ]);

    return Response.json({ success: true, wallpapers });
  } catch (error) {
    console.error('Failed to get trending wallpapers:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};
