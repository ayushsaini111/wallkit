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
  // Match only if category param is provided, else match all
  {
    $match: {
          category: { $regex: new RegExp(name, 'i') } // case-insensitive match
        }
  },
  // Populate user details using $lookup
  {
    $lookup: {
      from: 'users', // collection name in MongoDB
      localField: 'uploadedBy', // field in Wallpaper model
      foreignField: '_id',
      as: 'userDetails'
    }
  },
  // Unwind the array to flatten user object
  {
    $unwind: '$userDetails'
  },
  // Optional: project only the fields you want
  {
   $project: {
          _id: 1,
          title: 1,
          imageUrl: 1,
          tags: 1,
          createdAt: 1,
          'userDetails.username': 1,
          'userDetails.avatar': 1,
          'userDetails._id': 1, // Include user ID if needed
        },
  },
  // Optional: sort by most recent
  {
    $sort: { createdAt: -1 }
  }
])



    console.log('[CATEGORY] Aggregated wallpapers:', wallpapers);
    return NextResponse.json({ wallpapers });

  } catch (error) {
    console.error('[CATEGORY] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch by category' }, { status: 500 });
  }
};
