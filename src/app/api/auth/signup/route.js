import bcrypt from 'bcryptjs';
import { User } from '@/models/user.model';
import dbConnect from '@/lib/dbConnect';
import { sendWelcomeEmail } from "@/lib/mailer";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

console.log('🔧 Auth route loaded, authOptions available:', !!authOptions);

// POST - Create new user
export async function POST(request) {
  try {
    console.log('[SIGNUP] Connecting to DB...');
    await dbConnect();

    console.log('[SIGNUP] Parsing JSON data...');
    const { username, email, password, avatarUrl } = await request.json();

    // Validation
    if (!username || !email || !password) {
      console.warn('[SIGNUP] Missing required fields');
      return Response.json({ 
        success: false, 
        message: 'Username, email, and password are required' 
      }, { status: 400 });
    }

    // ✅ Check for existing email
    console.log('[SIGNUP] Checking for existing email...');
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.warn('[SIGNUP] Email already in use:', email);
      return Response.json({ 
        success: false, 
        message: 'Email already in use' 
      }, { status: 400 });
    }

    // ❌ Reject if username exists
    console.log('[SIGNUP] Checking for existing username...');
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.warn('[SIGNUP] Username already taken:', username);
      return Response.json({ 
        success: false, 
        message: 'Username already taken' 
      }, { status: 400 });
    }

    // ✅ Create user - Save the Cloudinary avatar URL
    console.log('[SIGNUP] Creating new user...');
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      avatar: avatarUrl || "", // ✅ Use Cloudinary URL from frontend
      provider: 'local',
      emailNotifications: true,
    });

    console.log('[SIGNUP] User created successfully:', newUser._id);
    console.log('[SIGNUP] Avatar URL saved:', avatarUrl);
    
    // Send welcome email
    try {
      await sendWelcomeEmail({ email, name: username });
      console.log('[SIGNUP] Welcome email sent successfully');
    } catch (emailError) {
      console.warn('[SIGNUP] Welcome email failed, but user created:', emailError.message);
    }

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
    console.error('[SIGNUP] Error:', error);
    return Response.json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}