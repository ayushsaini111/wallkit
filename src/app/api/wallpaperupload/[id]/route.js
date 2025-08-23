import connectToDB from '@/lib/dbConnect';
import { Wallpaper } from '@/models/wallpaper.model';

export async function PATCH(req, { params }) {
  try {
    const { id } = params; // Get :id from URL
    const { imageUrl, storageId, appwriteId } = await req.json();

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Wallpaper ID is required' }),
        { status: 400 }
      );
    }

    await connectToDB();

    const updateData = {};
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (storageId) updateData.storageId = storageId;
    if (appwriteId) updateData.appwriteId = appwriteId;

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
