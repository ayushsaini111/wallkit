import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Download } from '@/models/download.model';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function POST(req) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const userId = session?.user?._id || null;

    const body = await req.json();
    const { wallpaperId } = body;

    if (!wallpaperId) {
      return NextResponse.json({ message: 'wallpaperId is required' }, { status: 400 });
    }

    // ✅ If user is logged in, prevent duplicate download
    if (userId) {
      const alreadyDownloaded = await Download.findOne({ user: userId, wallpaper: wallpaperId });

      if (alreadyDownloaded) {
        return NextResponse.json(
          { message: 'You have already downloaded this wallpaper' },
          { status: 200 }
        );
      }
    }

    // ✅ Create download record
    const download = await Download.create({
      user: userId,
      wallpaper: wallpaperId,
    });

    console.log('[DOWNLOAD LOGGED]', download);
    return NextResponse.json({ message: 'Download recorded', download }, { status: 201 });

  } catch (error) {
    console.error('[DOWNLOAD ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}
