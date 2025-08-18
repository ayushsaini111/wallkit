import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { Collection } from "@/models/collection.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const POST = async (req) => {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session)
      return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

    const { collectionId, wallpaperId } = await req.json();

    if (!collectionId || !wallpaperId) {
      return new Response(
        JSON.stringify({ success: false, message: "Collection ID and Wallpaper ID are required" }),
        { status: 400 }
      );
    }

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return new Response(
        JSON.stringify({ success: false, message: "Collection not found" }),
        { status: 404 }
      );
    }

    // Check ownership
    if (collection.user.toString() !== session.user.id) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized to modify this collection" }),
        { status: 403 }
      );
    }

    // Remove the wallpaper from the collection
    collection.wallpapers = collection.wallpapers.filter(
      (id) => id.toString() !== wallpaperId
    );

    await collection.save();

    return new Response(
      JSON.stringify({ success: true, message: "Wallpaper removed from collection" }),
      { status: 200 }
    );

  } catch (err) {
    console.error("Error removing wallpaper:", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500 }
    );
  }
};

export const GET = async (req) => {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const collectionName = searchParams.get("name");
    if (!collectionName) {
      return new Response(
        JSON.stringify({ success: false, message: "Collection name is required" }),
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    
    // Handle "default" collection name specifically
    const searchQuery = collectionName.toLowerCase() === 'default' 
      ? { name: { $regex: /^default$/i }, user: userId }
      : { name: collectionName, user: userId };

    const collection = await Collection.findOne(searchQuery);
    
    if (!collection) {
      // For default collection, create one if it doesn't exist
      if (collectionName.toLowerCase() === 'default') {
        const defaultCollection = new Collection({
          name: 'Default',
          user: userId,
          wallpapers: []
        });
        await defaultCollection.save();
        
        return new Response(
          JSON.stringify({ success: true, wallpapers: [] }),
          { status: 200 }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, message: "Collection not found" }),
        { status: 404 }
      );
    }

    // If collection has no wallpapers, return empty array
    if (!collection.wallpapers || collection.wallpapers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, wallpapers: [] }),
        { status: 200 }
      );
    }

    // Get wallpapers with all necessary data
    const wallpapers = await Collection.aggregate([
      { 
        $match: { 
          _id: collection._id,
          user: userId
        } 
      },
      {
        $lookup: {
          from: "wallpapers",
          localField: "wallpapers",
          foreignField: "_id",
          as: "wallpaperData"
        }
      },
      { 
        $unwind: {
          path: "$wallpaperData",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "wallpaperData.uploadedBy",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { 
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "likes",
          localField: "wallpaperData._id",
          foreignField: "wallpaper",
          as: "likes"
        }
      },
      {
        $lookup: {
          from: "views",
          localField: "wallpaperData._id",
          foreignField: "wallpaper",
          as: "views"
        }
      },
      {
        $lookup: {
          from: "downloads",
          localField: "wallpaperData._id",
          foreignField: "wallpaper",
          as: "downloads"
        }
      },
      {
        $lookup: {
          from: "follows",
          localField: "wallpaperData.uploadedBy",
          foreignField: "following",
          as: "followers"
        }
      },
      {
        $project: {
          _id: "$wallpaperData._id",
          title: "$wallpaperData.title",
          description: "$wallpaperData.description",
          imageUrl: "$wallpaperData.imageUrl",
          tags: "$wallpaperData.tags",
          createdAt: "$wallpaperData.createdAt",
          userDetails: {
            _id: { $ifNull: ["$userDetails._id", null] },
            username: { $ifNull: ["$userDetails.username", "Anonymous"] },
            avatar: { $ifNull: ["$userDetails.avatar", null] }
          },
          likeCount: { $size: "$likes" },
          viewCount: { $size: "$views" },
          downloadCount: { $size: "$downloads" },
          followerCount: { $size: "$followers" }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    return new Response(
      JSON.stringify({ success: true, wallpapers }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching wallpapers from collection:", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500 }
    );
  }
};

export const DELETE = async (req) => {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { collectionId, wallpaperId } = await req.json();

    if (!collectionId || !wallpaperId) {
      return new Response(
        JSON.stringify({ success: false, message: "Collection ID and Wallpaper ID are required" }),
        { status: 400 }
      );
    }

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return new Response(
        JSON.stringify({ success: false, message: "Collection not found" }),
        { status: 404 }
      );
    }

    // Check ownership
    if (collection.user.toString() !== session.user.id) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized to modify this collection" }),
        { status: 403 }
      );
    }

    // Add wallpaper if not already present
    if (!collection.wallpapers.includes(wallpaperId)) {
      collection.wallpapers.push(wallpaperId);
      await collection.save();
    }

    return new Response(
      JSON.stringify({ success: true, collection }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error adding wallpaper to collection:", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500 }
    );
  }
};