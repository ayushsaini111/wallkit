import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Follow from '@/models/follow.model';
import { User } from '@/models/user.model';

export async function POST(req) {
  await dbConnect();

  try {
    const { following } = await req.json();
    console.log('[FOLLOW] Request to follow/unfollow user:', following);

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!following) {
      return NextResponse.json({ message: 'Missing following user ID' }, { status: 400 });
    }

    if (currentUser._id.toString() === following.toString()) {
      return NextResponse.json({ message: 'You cannot follow yourself' }, { status: 400 });
    }

    const existingFollow = await Follow.findOne({
      follower: currentUser._id,
      following,
    });

    let isFollowing;
    let message;

    if (existingFollow) {
      // Unfollow
      await Follow.findByIdAndDelete(existingFollow._id);
      isFollowing = false;
      message = 'Unfollowed successfully';
      console.log('[UNFOLLOWED]', following);
    } else {
      // Follow
      const newFollow = await Follow.create({
        follower: currentUser._id,
        following,
      });
      isFollowing = true;
      message = 'Followed successfully';
      console.log('[FOLLOWED]', newFollow);
    }

    // Get updated follower count
    const followerCount = await Follow.countDocuments({ following });

    // Return consistent response with follow status and count
    return NextResponse.json({
      message,
      isFollowing,
      followerCount,
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('[FOLLOW ERROR]', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const following = searchParams.get('following');

    if (!following) {
      return NextResponse.json({ message: 'Missing following user ID' }, { status: 400 });
    }

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const isFollowing = await Follow.exists({
      follower: currentUser._id,
      following,
    });

    const followerCount = await Follow.countDocuments({ following });

    return NextResponse.json({
      isFollowing: Boolean(isFollowing),
      followerCount,
      success: true
    });
  } catch (error) {
    console.error('[FOLLOW GET ERROR]', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}