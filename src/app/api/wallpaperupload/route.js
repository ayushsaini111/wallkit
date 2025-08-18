// app/api/wallpapers/upload/route.js
import connectToDB from '@/lib/dbConnect';
import { Wallpaper } from '@/models/wallpaper.model';
import { notifyFollowersAfterUpload } from '@/utils/notifications'; // adjust path

// CREATE wallpaper
export async function POST(req) {
  console.log('[UPLOAD] Parsing form data...');

  try {
    const formData = await req.formData();

    const title = formData.get('title');
    const description = formData.get('description');
    const tags = formData.get('tags')?.split(',').map(tag => tag.trim());
    const imageUrl = formData.get('imageUrl'); // from Appwrite upload
    const userId = formData.get('userId'); // sent from frontend
    const isPrivate = formData.get('isPrivate') === 'true';
    const appwriteId = formData.get('appwriteId'); // Appwrite file ID
    const category = formData.get('category');
    console.log("pp",isPrivate);
    

    console.log('[UPLOAD] Received:', { title, description, tags, imageUrl, category, userId, isPrivate, appwriteId });

    await connectToDB();

    const newWallpaper = await Wallpaper.create({
      title,
      description,
      tags,
      imageUrl,
      uploadedBy: userId,
      isPrivate,
      appwriteId,
      category,
    });
    if (!isPrivate) {
      console.log('Calling notification function...');
      await notifyFollowersAfterUpload({ wallpaperId: newWallpaper._id });
      console.log('Notification function completed');
    }

    return new Response(JSON.stringify({ success: true, wallpaper: newWallpaper }), {
      status: 201,
    });
  } catch (error) {
    console.error('[UPLOAD] Error:', error.message);
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
    });
  }
}
// UPDATE wallpaper
export async function PUT(req) {
  try {
    const { id, title, description, category, tags } = await req.json(); // changed wallpaperId → id

    if (!id) {
      return new Response(JSON.stringify({ success: false, message: 'Wallpaper ID is required' }), {
        status: 400,
      });
    }

    await connectToDB();

    const updated = await Wallpaper.findByIdAndUpdate(
      id,
      { title, description, category, tags },
      { new: true }
    );

    if (!updated) {
      return new Response(JSON.stringify({ success: false, message: 'Wallpaper not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ success: true, wallpaper: updated }), { status: 200 });
  } catch (error) {
    console.error('[UPDATE] Error:', error.message);
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}

// DELETE wallpaper
export async function DELETE(req) {
  try {
    const { id } = await req.json(); // changed wallpaperId → id

    if (!id) {
      return new Response(JSON.stringify({ success: false, message: 'Wallpaper ID is required' }), {
        status: 400,
      });
    }

    await connectToDB();

    const deleted = await Wallpaper.findByIdAndDelete(id);

    if (!deleted) {
      return new Response(JSON.stringify({ success: false, message: 'Wallpaper not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Wallpaper deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error('[DELETE] Error:', error.message);
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}
