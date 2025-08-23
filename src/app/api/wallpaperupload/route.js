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
    const tags = formData.get('tags')?.split(',').map(tag => tag.trim()) || [];
    const imageUrl = formData.get('imageUrl'); // original (Appwrite or Cloudinary)
    const compressedUrl = formData.get('compressedUrl'); // Cloudinary compressed version
    const userId = formData.get('userId');
    const isPrivate = formData.get('isPrivate') === 'true';
    const appwriteId = formData.get('appwriteId') || null; // may not exist if <10MB
    const category = formData.get('category');

    console.log('[UPLOAD] Received:', {
      title,
      description,
      tags,
      imageUrl,
      compressedUrl,
      category,
      userId,
      isPrivate,
      appwriteId,
    });

    await connectToDB();

    const newWallpaper = await Wallpaper.create({
      title,
      description,
      tags,
      imageUrl, // original
      compressedUrl, // optimized for web
      uploadedBy: userId,
      isPrivate,
      appwriteId,
      category,
    });

    console.log('Calling notification function...');
    // await notifyFollowersAfterUpload({ wallpaperId: newWallpaper._id });
    console.log('Notification function completed');

    return new Response(JSON.stringify({ success: true, wallpaper: newWallpaper }), {
      status: 201,
    });
  } catch (error) {
    console.error('[UPLOAD] Error:', error.message);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
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


// PATCH wallpaper (update original URL or storage ID)
export async function PATCH(req) {
  try {
    const { id, imageUrl, storageId, appwriteId } = await req.json();

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Wallpaper ID is required' }),
        { status: 400 }
      );
    }

    await connectToDB();

    const updateData = {};
    if (imageUrl) updateData.imageUrl = imageUrl;         // original file URL
    if (storageId) updateData.storageId = storageId;      // Cloudinary file ID
    if (appwriteId) updateData.appwriteId = appwriteId;   // Appwrite file ID (if any)

    const updatedWallpaper = await Wallpaper.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedWallpaper) {
      return new Response(
        JSON.stringify({ success: false, message: 'Wallpaper not found' }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, wallpaper: updatedWallpaper }),
      { status: 200 }
    );
  } catch (error) {
    console.error('[PATCH] Error:', error.message);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}
