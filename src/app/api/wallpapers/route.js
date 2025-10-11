import dbConnect from '@/lib/dbConnect';
import { Wallpaper } from '@/models/wallpaper.model';

export const GET = async (request) => {
  try {
    await dbConnect();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // For random wallpapers, we'll use a different approach
    // Option 1: Random sort (works better with pagination)
    const wallpapers = await Wallpaper.aggregate([
      // Match only non-private wallpapers
      {
        $match: {
          isPrivate: { $ne: true }
        }
      },

      // Add a random field for sorting
      {
        $addFields: {
          randomSort: { $rand: {} }
        }
      },

      // Sort by the random field
      {
        $sort: { randomSort: 1 }
      },

      // Apply pagination
      { $skip: skip },
      { $limit: limit },

      // Lookup user details
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
          as: 'likes',
        },
      },

      // Lookup Views
      {
        $lookup: {
          from: 'views',
          localField: '_id',
          foreignField: 'wallpaper',
          as: 'views',
        },
      },

      // Lookup Downloads
      {
        $lookup: {
          from: 'downloads',
          localField: '_id',
          foreignField: 'wallpaper',
          as: 'downloads',
        },
      },

      // Lookup Followers of uploader
      {
        $lookup: {
          from: 'follows',
          localField: 'uploadedBy',
          foreignField: 'following',
          as: 'followers',
        },
      },

      // Final projection
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          imageUrl: 1,
          compressedUrl: 1,
          tags: 1,
          category: 1,
          createdAt: 1,
          isPrivate: 1,
          'userDetails.username': 1,
          'userDetails.avatar': 1,
          'userDetails._id': 1,
          likeCount: { $size: '$likes' },
          viewCount: { $size: '$views' },
          downloadCount: { $size: '$downloads' },
          followerCount: { $size: '$followers' },
        },
      },
    ]);

    // Get total count for hasMore calculation
    const totalCount = await Wallpaper.countDocuments({ isPrivate: { $ne: true } });
    const hasMore = (skip + wallpapers.length) < totalCount;

    return Response.json({
      success: true,
      wallpapers,
      pagination: {
        currentPage: page,
        limit,
        hasMore,
        total: totalCount,
        loaded: skip + wallpapers.length
      },
    });
  } catch (error) {
    console.error('Failed to get wallpapers:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};