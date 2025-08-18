import path from 'path';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '@/models/user.model';
import dbConnect from '@/lib/dbConnect';
import { uploadImageToAppwrite } from '@/lib/appwrite/storage';
import { sendWelcomeEmail } from "@/lib/mailer";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // ✅ Try this path first

// If the above doesn't work, try these alternative imports:
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import { authOptions } from '@/pages/api/auth/[...nextauth]';

console.log('🔧 Auth route loaded, authOptions available:', !!authOptions);

// POST - Create new user (existing functionality)
export async function POST(request) {
  try {
    console.log('[SIGNUP] Connecting to DB...');
    await dbConnect();

    console.log('[SIGNUP] Parsing form data...');
    const formData = await request.formData();
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const avatar = formData.get('avatar');

    let avatarUrl = null;

    // ✅ Upload avatar to Appwrite
    if (avatar && typeof avatar === 'object' && avatar.arrayBuffer) {
      console.log('[SIGNUP] Avatar received, preparing for upload...');
      const buffer = Buffer.from(await avatar.arrayBuffer());
      const filename = `${randomUUID()}_${avatar.name}`;
      const tempDir = path.join(process.cwd(), 'tmp');
      await mkdir(tempDir, { recursive: true });

      const tempFilePath = path.join(tempDir, filename);
      await writeFile(tempFilePath, buffer);
      console.log('[SIGNUP] Temp file written at:', tempFilePath);

      try {
        console.log('[SIGNUP] Uploading avatar to Appwrite...');
        const file = new File([buffer], avatar.name, { type: avatar.type });
        avatarUrl = await uploadImageToAppwrite(file);
        console.log('[SIGNUP] Avatar uploaded, URL:', avatarUrl);
      } finally {
        await unlink(tempFilePath);
        console.log('[SIGNUP] Temp file deleted:', tempFilePath);
      }
    }

    // ✅ Check for existing email
    console.log('[SIGNUP] Checking for existing email...');
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.warn('[SIGNUP] Email already in use:', email);
      return Response.json({ success: false, error: 'Email already in use' }, { status: 400 });
    }

    // ❌ Reject if username exists
    console.log('[SIGNUP] Checking for existing username...');
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.warn('[SIGNUP] Username already taken:', username);
      return Response.json({ success: false, error: 'Username already taken' }, { status: 400 });
    }

    // ✅ Create user
    console.log('[SIGNUP] Creating new user...');
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      avatar: avatarUrl?.url || "",
      provider: 'local',
      emailNotifications: true,
    });

    console.log('[SIGNUP] User created successfully:', newUser._id);
    await sendWelcomeEmail({ email, name: username });

    return Response.json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar
      },
    });

  } catch (error) {
    console.log('[SIGNUP] Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
