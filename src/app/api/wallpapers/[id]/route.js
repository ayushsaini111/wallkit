import dbConnect from '@/lib/dbConnect';
import { Wallpaper } from '@/models/wallpaper.model';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

// IMPORTANT: This file should be at: app/api/wallpaper/[id]/route.js

export async function GET(request, { params }) {
  try {
    await dbConnect();

    // In Next.js 15+, params might be a Promise, so await it
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid wallpaper ID format' },
        { status: 400 }
      );
    }

    const wallpaper = await Wallpaper.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
          isPrivate: { $ne: true },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'uploadedBy',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'wallpaper',
          as: 'likes',
        },
      },
      {
        $lookup: {
          from: 'views',
          localField: '_id',
          foreignField: 'wallpaper',
          as: 'views',
        },
      },
      {
        $lookup: {
          from: 'downloads',
          localField: '_id',
          foreignField: 'wallpaper',
          as: 'downloads',
        },
      },
      {
        $lookup: {
          from: 'follows',
          localField: 'uploadedBy',
          foreignField: 'following',
          as: 'followers',
        },
      },
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

    if (!wallpaper || wallpaper.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Wallpaper not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      wallpaper: wallpaper[0] 
    });
  } catch (error) {
    console.error('Failed to get wallpaper:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Optional: Add OPTIONS for CORS if needed
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}