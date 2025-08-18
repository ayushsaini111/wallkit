import { Storage, ID } from 'appwrite';
import { client } from '@/config/appwrite';

const storage = new Storage(client);

export const uploadImageToAppwrite = async (file) => {
  try {
    const response = await storage.createFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
      ID.unique(),
      file
    );
    console.log('[APPWRITE STORAGE] File uploaded:', response);

    const url = storage.getFileView(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
      response.$id
    );

    console.log('[APPWRITE STORAGE] File View URL:', url);

    const appwriteobj = {
      url,
      id: response.$id
    };

    return appwriteobj // ✅ Works without paid plan
  } catch (error) {
    console.error('Appwrite Upload Error:', error);
    throw error;
  }
};
