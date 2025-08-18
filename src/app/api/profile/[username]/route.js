import connectToDB from '@/lib/dbConnect';
import { User } from '@/models/user.model';
import { Wallpaper } from '@/models/wallpaper.model';
import mongoose from 'mongoose';

export async function GET(request, context) {
  const { params } = context;
  const identifier = params.username; // Can be username or _id
  
  try {
    await connectToDB();

    // First, determine if identifier is an ObjectId or username
    let userQuery;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      userQuery = { _id: new mongoose.Types.ObjectId(identifier) };
    } else {
      userQuery = { username: identifier };
    }

    // 👤 Get user with follower/following counts
    const userAggregation = await User.aggregate([
      { $match: userQuery },
      {
        $lookup: {
          from: 'follows',
          localField: '_id',
          foreignField: 'following',
          as: 'followers'
        }
      },
      {
        $lookup: {
          from: 'follows',
          localField: '_id',
          foreignField: 'follower',
          as: 'following'
        }
      },
      {
        $addFields: {
          followersCount: { $size: '$followers' },
          followingCount: { $size: '$following' }
        }
      },
      {
        $project: {
          _id: 1,
          username: 1,
          email: 1,
          avatar: 1,
          createdAt: 1,
          followersCount: 1,
          followingCount: 1
        }
      }
    ]);

    if (!userAggregation?.length) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }

    const user = userAggregation[0];
    const userId = user._id;

    // 🧱 Aggregate wallpaper stats with proper data structure
    const wallpapers = await Wallpaper.aggregate([
      { $match: { uploadedBy: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'wallpaper',
          as: 'likes'
        }
      },
      {
        $lookup: {
          from: 'views',
          localField: '_id',
          foreignField: 'wallpaper',
          as: 'views'
        }
      },
      {
        $lookup: {
          from: 'downloads',
          localField: '_id',
          foreignField: 'wallpaper',
          as: 'downloads'
        }
      },
      {
        $lookup: {
          from: 'favorites',
          localField: '_id',
          foreignField: 'wallpaper',
          as: 'favorites'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'uploadedBy',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $addFields: {
          likeCount: { $size: '$likes' },
          viewCount: { $size: '$views' },
          downloadCount: { $size: '$downloads' },
          favoriteCount: { $size: '$favorites' }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          imageUrl: 1,
          tags: 1,
          category: 1,
          createdAt: 1,
          likeCount: 1,
          viewCount: 1,
          downloadCount: 1,
          favoriteCount: 1,
          userDetails: {
            _id: '$userDetails._id',
            username: '$userDetails.username',
            avatar: '$userDetails.avatar'
          }
        }
      }
    ]);

    // Calculate totals
    const totalLikes = wallpapers.reduce((sum, w) => sum + (w.likeCount || 0), 0);
    const totalFavorites = wallpapers.reduce((sum, w) => sum + (w.favoriteCount || 0), 0);
    const totalDownloads = wallpapers.reduce((sum, w) => sum + (w.downloadCount || 0), 0);

    return new Response(JSON.stringify({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt
      },
      stats: {
        totalUploads: wallpapers.length,
        totalLikes,
        totalFavorites,
        totalDownloads,
        followers: user.followersCount || 0,
        following: user.followingCount || 0
      },
      wallpapers
    }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('[PROFILE_ROUTE_AGGREGATION_ERROR]', error);
    return new Response(JSON.stringify({ 
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}