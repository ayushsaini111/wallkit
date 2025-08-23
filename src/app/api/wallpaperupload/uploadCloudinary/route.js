import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get('file');

    if (!file) throw new Error('No file uploaded');

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload using a promise wrapper
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'wallpapers' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(buffer);
    });

    console.log("Original file uploaded to Cloudinary:", uploadResult);

    // Return public_id (id) and secure_url (url)
    return NextResponse.json({
      id: uploadResult.public_id,
      url: uploadResult.secure_url,

    });
  } catch (err) {
    console.error('Cloudinary Upload Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
