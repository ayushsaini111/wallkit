// import { Storage, ID } from 'appwrite';
// import { client } from '@/config/appwrite';

// const storage = new Storage(client);

// export const uploadImageToAppwrite = async (file) => {
//   try {
//     // Upload file
//     const response = await storage.createFile(
//       process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
//       ID.unique(),
//       file
//     );

//     console.log('[APPWRITE STORAGE] File uploaded:', response);

//     // ✅ Compressed Preview (quality set to 30%)
//     const previewUrl = storage.getFilePreview(
//       process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
//       response.$id,
//       0, // width (0 = auto)
//       0, // height (0 = auto)
//       'top',
//       30 // quality (0–100)
//     );

//     // ✅ Original File (Download / Full Quality)
//     const downloadUrl = storage.getFileView(
//       process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
//       response.$id
//     );

//     return {
//       id: response.$id,
//       previewUrl,   // 👈 lightweight preview (compressed)
//       downloadUrl   // 👈 original quality for downloads
//     };

//   } catch (error) {
//     console.error('Appwrite Upload Error:', error);
//     throw error;
//   }
// };


// appwrite-upload.js - Fixed for Download Compatibility

import { Storage, ID } from 'appwrite';
import { client } from '@/config/appwrite';

const storage = new Storage(client);

export const uploadImageToAppwrite = async (file) => {
  try {
    // Upload file to Appwrite
    const response = await storage.createFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
      ID.unique(),
      file
    );

    console.log('[APPWRITE STORAGE] File uploaded:', response);

    // ✅ For FREE PLAN - Use view URL for both preview and download
    // This avoids any transformation requests that would cause 403 errors
    const viewUrl = storage.getFileView(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
      response.$id
    );

    // Add project parameter to ensure proper access
    const baseUrl = viewUrl.href || viewUrl;
    const urlWithProject = baseUrl.includes('?') 
      ? `${baseUrl}&project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
      : `${baseUrl}?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

    return {
      id: response.$id,
      // ✅ Use same URL for both preview and download on free plan
      previewUrl: urlWithProject,   // Original quality (no compression)
      downloadUrl: urlWithProject   // Same as preview for free plan
    };

  } catch (error) {
    console.error('Appwrite Upload Error:', error);
    throw error;
  }
};

// ✅ Alternative function if you want to try preview (but it will fail on free plan)
export const uploadImageToAppwriteWithPreview = async (file) => {
  try {
    const response = await storage.createFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
      ID.unique(),
      file
    );

    console.log('[APPWRITE STORAGE] File uploaded:', response);

    // ✅ Try to get preview URL (will work if you have paid plan)
    let previewUrl;
    try {
      previewUrl = storage.getFilePreview(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
        response.$id,
        0, // width (0 = auto)
        0, // height (0 = auto)
        'top',
        30 // quality (0–100)
      );
      console.log('[APPWRITE] Preview URL generated (paid plan detected)');
    } catch (previewError) {
      console.warn('[APPWRITE] Preview failed (free plan), using view URL:', previewError);
      // Fallback to view URL for free plan
      previewUrl = storage.getFileView(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
        response.$id
      );
    }

    // ✅ Original File (Download / Full Quality) - Always use view
    const downloadUrl = storage.getFileView(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
      response.$id
    );

    // Ensure URLs have project parameter
    const addProjectParam = (url) => {
      const urlStr = url.href || url;
      return urlStr.includes('?') 
        ? `${urlStr}&project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
        : `${urlStr}?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
    };

    return {
      id: response.$id,
      previewUrl: addProjectParam(previewUrl),
      downloadUrl: addProjectParam(downloadUrl)
    };

  } catch (error) {
    console.error('Appwrite Upload Error:', error);
    throw error;
  }
};

// ✅ Utility function to check if Appwrite account supports transformations
export const checkAppwritePlan = async () => {
  try {
    // Try to create a test preview to check plan capabilities
    const testFileId = 'test'; // This will fail, but we can check the error
    
    try {
      storage.getFilePreview(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
        testFileId,
        100,
        100,
        'top',
        50
      );
    } catch (error) {
      if (error.code === 403 && error.type === 'storage_image_transformations_blocked') {
        return 'free';
      } else if (error.code === 404) {
        // File not found is expected, but no transformation error = paid plan
        return 'paid';
      }
    }
    
    return 'unknown';
  } catch (error) {
    console.error('Could not check Appwrite plan:', error);
    return 'unknown';
  }
};