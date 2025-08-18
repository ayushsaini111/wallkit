import dbConnect from "@/lib/dbConnect";
import { Collection } from "@/models/collection.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export const GET = async () => {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session)
      return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

    const userId = new mongoose.Types.ObjectId(session.user.id);

    let collections = await Collection.aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: "wallpapers",
          localField: "wallpapers",
          foreignField: "_id",
          as: "wallpaperData",
        },
      },
      {
        $addFields: {
          wallpaperCount: { $size: "$wallpaperData" },
          wallpaperPreview: { $slice: ["$wallpaperData", 3] },
        },
      },
      {
        $project: {
          name: 1,
          wallpapers: 1, // FIXED: Include wallpapers array for checking
          wallpaperCount: 1,
          wallpaperPreview: { _id: 1, title: 1, imageUrl: 1 },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    // If user has no collections, create a default one
    if (collections.length === 0) {
      const newCollection = await Collection.create({
        user: userId,
        name: "My Collection",
        wallpapers: []
      });

      collections = [{
        _id: newCollection._id,
        name: newCollection.name,
        wallpapers: [],
        wallpaperCount: 0,
        wallpaperPreview: []
      }];
    }

    return new Response(JSON.stringify({ success: true, collections }));
  } catch (err) {
    console.error("Error fetching collections:", err);
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
};

export const POST = async (req) => {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session)
      return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

    const body = await req.json();

    // FIXED: Add or remove wallpaper to/from collection (toggle functionality)
    if (body.collectionId && body.wallpaperId) {
      const collection = await Collection.findById(body.collectionId);
      if (!collection) 
        return new Response(JSON.stringify({ success: false, message: "Collection not found" }), { status: 404 });

      // Check if user owns this collection
      if (collection.user.toString() !== session.user.id) {
        return new Response(JSON.stringify({ success: false, message: "Unauthorized to modify this collection" }), { status: 403 });
      }

      const wallpaperIndex = collection.wallpapers.findIndex(id => id.toString() === body.wallpaperId);
      
      if (wallpaperIndex > -1) {
        // Remove wallpaper if it already exists
        collection.wallpapers.splice(wallpaperIndex, 1);
        await collection.save();
        return new Response(JSON.stringify({ 
          success: true, 
          collection, 
          action: 'removed',
          message: 'Wallpaper removed from collection' 
        }));
      } else {
        // Add wallpaper if it doesn't exist
        collection.wallpapers.push(body.wallpaperId);
        await collection.save();
        return new Response(JSON.stringify({ 
          success: true, 
          collection, 
          action: 'added',
          message: 'Wallpaper added to collection' 
        }));
      }
    }

    // Create new collection
    if (body.name) {
      const collection = await Collection.create({ 
        user: session.user.id, 
        name: body.name.trim()
      });
      return new Response(JSON.stringify({ 
        success: true, 
        data: collection,
        collection: collection // FIXED: Also return as 'collection' for consistency
      }));
    }

    return new Response(JSON.stringify({ success: false, message: "Invalid request body" }), { status: 400 });
    
  } catch (err) {
    console.error("Error in POST /api/collect:", err);
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
};
export const PUT = async (req) => {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session)
      return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

    const body = await req.json();
    if (!body.collectionId || !body.newName)
      return new Response(JSON.stringify({ success: false, message: "collectionId and newName are required" }), { status: 400 });

    // Check ownership
    const collection = await Collection.findById(body.collectionId);
    if (!collection) {
      return new Response(JSON.stringify({ success: false, message: "Collection not found" }), { status: 404 });
    }

    if (collection.user.toString() !== session.user.id) {
      return new Response(JSON.stringify({ success: false, message: "Unauthorized to modify this collection" }), { status: 403 });
    }

    // Rename the collection
    const updated = await Collection.findByIdAndUpdate(
      body.collectionId,
      { name: body.newName.trim() },
      { new: true } // return the updated document
    );

    return new Response(JSON.stringify({ success: true, updated }));
  } catch (err) {
    console.error("Error in PUT /api/collect:", err);
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
};


export const DELETE = async (req) => {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session)
      return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) 
      return new Response(JSON.stringify({ success: false, message: "Collection ID required" }), { status: 400 });

    // FIXED: Check ownership before deleting
    const collection = await Collection.findById(id);
    if (!collection) {
      return new Response(JSON.stringify({ success: false, message: "Collection not found" }), { status: 404 });
    }

    if (collection.user.toString() !== session.user.id) {
      return new Response(JSON.stringify({ success: false, message: "Unauthorized to delete this collection" }), { status: 403 });
    }

    await Collection.findByIdAndDelete(id);
    return new Response(JSON.stringify({ success: true, message: "Collection deleted" }));
  } catch (err) {
    console.error("Error in DELETE /api/collect:", err);
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
};