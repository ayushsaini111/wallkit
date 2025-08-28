import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/models/user.model';
import dbConnect from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PATCH /api/user - Update user profile
export async function PATCH(request) {
  try {
    console.log('[USER UPDATE] Starting update process...');
    
    // Get session to verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get current user from database
    const currentUser = await User.findOne({
      $or: [
        { email: session.user.email },
        { _id: session.user.id || session.user._id }
      ]
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('[USER UPDATE] Current user found:', currentUser.email);

    // Parse JSON data
    const requestData = await request.json();
    console.log('[USER UPDATE] Request data received:', requestData); // 🔥 DEBUG

    const {
      username,
      email,
      bio,
      emailNotifications,
      currentPassword,
      newPassword,
      avatarUrl
    } = requestData;

    console.log('[USER UPDATE] Parsed email:', email); // 🔥 DEBUG
    console.log('[USER UPDATE] Current email:', currentUser.email); // 🔥 DEBUG

    // Validate required fields
    if (!username || !email) {
      return NextResponse.json(
        { success: false, error: 'Username and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if username is taken by another user
    if (username !== currentUser.username) {
      console.log('[USER UPDATE] Checking username availability...'); // 🔥 DEBUG
      const existingUsername = await User.findOne({ 
        username,
        _id: { $ne: currentUser._id }
      });
      if (existingUsername) {
        return NextResponse.json(
          { success: false, error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Check if email is taken by another user
    if (email !== currentUser.email) {
      console.log('[USER UPDATE] Email is different, checking availability...'); // 🔥 DEBUG
      console.log('[USER UPDATE] Searching for email:', email); // 🔥 DEBUG
      
      const existingEmail = await User.findOne({ 
        email,
        _id: { $ne: currentUser._id }
      });
      
      console.log('[USER UPDATE] Existing email found:', existingEmail); // 🔥 DEBUG
      
      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'Email already in use' },
          { status: 400 }
        );
      }
    } else {
      console.log('[USER UPDATE] Email is the same, no need to check availability'); // 🔥 DEBUG
    }

    // Prepare update data
    const updateData = {
      username: username.trim(),
      email: email.trim(), // 🔥 Make sure email is trimmed
      bio: bio?.trim() || '',
      emailNotifications: emailNotifications !== false,
    };

    console.log('[USER UPDATE] Update data prepared:', updateData); // 🔥 DEBUG

    // Handle avatar URL
    if (avatarUrl) {
      updateData.avatar = avatarUrl;
      console.log('[USER UPDATE] Avatar URL will be updated:', avatarUrl);
    }

    // Handle password update for local users
    if (newPassword && currentUser.provider !== 'google') {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password required to change password' },
          { status: 400 }
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Validate new password
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 6 characters long' },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
      console.log('[USER UPDATE] Password will be updated');
    }

    // 🔥 LOG THE EXACT UPDATE OPERATION
    console.log('[USER UPDATE] About to update user with ID:', currentUser._id);
    console.log('[USER UPDATE] Update data:', JSON.stringify(updateData, null, 2));

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
        // 🔥 Add these options for better debugging
        upsert: false,
        strict: true
      }
    );

    console.log('[USER UPDATE] Updated user result:', updatedUser); // 🔥 DEBUG

    if (!updatedUser) {
      console.log('[USER UPDATE] No user returned from update operation'); // 🔥 DEBUG
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      );
    }

    console.log('[USER UPDATE] User updated successfully');
    console.log('[USER UPDATE] New email in DB:', updatedUser.email); // 🔥 DEBUG

    // 🔥 VERIFY THE UPDATE BY FETCHING FRESH DATA
    const verificationUser = await User.findById(currentUser._id);
    console.log('[USER UPDATE] Verification fetch - email:', verificationUser?.email); // 🔥 DEBUG

    // Return safe user data (no password)
    const safeUser = {
      _id: updatedUser._id,
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      emailNotifications: updatedUser.emailNotifications,
      provider: updatedUser.provider,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    console.log('[USER UPDATE] Returning safe user data:', safeUser); // 🔥 DEBUG

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: safeUser,
    });

  } catch (error) {
    console.error('[USER UPDATE] Error:', error);
    console.error('[USER UPDATE] Error stack:', error.stack); // 🔥 DEBUG
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    console.log('[USER DELETE] Starting delete process...');
    
    // Get session to verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find and delete user
    const userToDelete = await User.findOne({
      $or: [
        { email: session.user.email },
        { _id: session.user.id || session.user._id }
      ]
    });

    if (!userToDelete) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('[USER DELETE] Found user to delete:', userToDelete.email);

    // Delete user from database
    await User.findByIdAndDelete(userToDelete._id);

    console.log('[USER DELETE] User deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });

  } catch (error) {
    console.error('[USER DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}