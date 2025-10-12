import dbConnect from '@/lib/dbConnect';
import { Wallpaper } from '@/models/wallpaper.model';
import mongoose from 'mongoose';

export const GET = async (request) => {
  try {
    await dbConnect();

    // Get query parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;

    // Validate parameters
    if (page < 1) {
      return Response.json(
        { success: false, message: 'Page must be greater than 0' },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 100) {
      return Response.json(
        { success: false, message: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const totalCount = await Wallpaper.countDocuments({});

    // Main aggregation pipeline with pagination
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
      { 
        $match: {
          'userDetails': { $ne: [] } // Only include wallpapers with valid users
        }
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

      // Pagination
      { $skip: skip },
      { $limit: limit }
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;
    const hasPrevious = page > 1;

    const pagination = {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasMore,
      hasPrevious,
      resultCount: wallpapers.length,
      skip
    };

    return Response.json({ 
      success: true, 
      wallpapers,
      pagination
    });

  } catch (error) {
    console.error('Failed to get trending wallpapers:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};