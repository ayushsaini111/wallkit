import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/models/user.model';
import dbConnect from '@/lib/dbConnect';
import { uploadImageToAppwrite } from '@/lib/appwrite/storage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { randomUUID } from 'crypto';

// PATCH /api/user/update - Update user profile
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

    // Parse form data
    const formData = await request.formData();
    const username = formData.get('username')?.trim();
    const email = formData.get('email')?.trim();
    const bio = formData.get('bio')?.trim();
    const emailNotifications = formData.get('emailNotifications') === 'true';
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const avatar = formData.get('avatar');

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
      const existingEmail = await User.findOne({ 
        email,
        _id: { $ne: currentUser._id }
      });
      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      username,
      email,
      bio: bio || '',
      emailNotifications,
    };

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

    // Handle avatar upload
    if (avatar && typeof avatar === 'object' && avatar.arrayBuffer) {
      try {
        console.log('[USER UPDATE] Processing avatar upload...');
        
        // Validate file size (5MB max)
        if (avatar.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { success: false, error: 'Avatar file size must be less than 5MB' },
            { status: 400 }
          );
        }

        // Validate file type
        if (!avatar.type.startsWith('image/')) {
          return NextResponse.json(
            { success: false, error: 'Avatar must be an image file' },
            { status: 400 }
          );
        }

        // Create File object for upload
        const buffer = await avatar.arrayBuffer();
        const filename = `${randomUUID()}_${avatar.name}`;
        const file = new File([buffer], filename, { type: avatar.type });
        
        // Upload to Appwrite
        const uploadResult = await uploadImageToAppwrite(file);
        if (uploadResult && uploadResult.url) {
          updateData.avatar = uploadResult.url;
          console.log('[USER UPDATE] Avatar uploaded successfully:', uploadResult.url);
        }
      } catch (uploadError) {
        console.error('[USER UPDATE] Avatar upload failed:', uploadError);
        return NextResponse.json(
          { success: false, error: 'Failed to upload avatar' },
          { status: 500 }
        );
      }
    }

    // Update user in database
    console.log('[USER UPDATE] Updating user with data:', Object.keys(updateData));
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      );
    }

    console.log('[USER UPDATE] User updated successfully');

    // Return safe user data (no password)
    const safeUser = {
      _id: updatedUser._id,
      id: updatedUser._id, // For compatibility
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      emailNotifications: updatedUser.emailNotifications,
      provider: updatedUser.provider,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: safeUser,
    });

  } catch (error) {
    console.error('[USER UPDATE] Error:', error);
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