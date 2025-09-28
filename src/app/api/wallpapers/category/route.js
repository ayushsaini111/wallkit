import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Wallpaper } from '@/models/wallpaper.model';

export const GET = async (req) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');

    console.log('[CATEGORY] Fetching wallpapers for category:', name);

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const wallpapers = await Wallpaper.aggregate([
      // Match wallpapers by category
      {
        $match: {
          category: { $regex: new RegExp(name, 'i') } // case-insensitive match
        }
      },
      
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

      // Final projection with counts (same as your first API)
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          imageUrl: 1,
          compressedUrl: 1,
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
      
      // Sort by most recent
      { $sort: { createdAt: -1 } },
    ]);

    console.log('[CATEGORY] Aggregated wallpapers:', wallpapers);
    
    // Return in the same format as your first API
    return NextResponse.json({ success: true, wallpapers });

  } catch (error) {
    console.error('[CATEGORY] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};