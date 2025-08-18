'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const { data: session, status, update: updateSession } = useSession()
  const [user, setUser] = useState(null)
  const loading = status === 'loading'

  // Update user when session changes
  useEffect(() => {
    if (session?.user) {
      const sessionUser = {
        _id: session.user._id || session.user.id,
        id: session.user._id || session.user.id,
        username: session.user.username || session.user.name?.replace(/\s/g, '').toLowerCase(),
        email: session.user.email,
        avatar: session.user.avatar || session.user.image,
        image: session.user.avatar || session.user.image, // For NextAuth compatibility
        name: session.user.name,
        bio: session.user.bio || '',
        emailNotifications: session.user.emailNotifications !== false,
        provider: session.user.provider || 'google',
        createdAt: session.user.createdAt,
        updatedAt: session.user.updatedAt,
      }
      
      setUser(sessionUser)
      console.log('🔄 AuthContext: User updated from session', sessionUser.email)
    } else {
      setUser(null)
      console.log('🔄 AuthContext: User cleared')
    }
  }, [session])

  // 🔥 ENHANCED updateUser function for instant UI updates
  const updateUser = async (updatedUserData) => {
    try {
      console.log('🚀 AuthContext: Updating user data...', updatedUserData);
      
      // Create the new user object with updated data
      const newUser = {
        ...user,
        ...updatedUserData,
        // Ensure both avatar and image fields are updated for compatibility
        avatar: updatedUserData.avatar || updatedUserData.image || user?.avatar,
        image: updatedUserData.avatar || updatedUserData.image || user?.image,
      };
      
      // 🔥 CRITICAL: Update context state immediately for instant UI updates
      setUser(newUser);
      console.log('✅ AuthContext: User state updated instantly');
      
      // Update NextAuth session if it exists
      if (session && updateSession) {
        try {
          // 🔥 KEY FIX: Pass the updated data directly to updateSession
          // NextAuth will merge this with the existing session
          const sessionUpdateData = {
            ...updatedUserData,
            // Ensure NextAuth compatibility
            image: updatedUserData.avatar || updatedUserData.image,
            avatar: updatedUserData.avatar || updatedUserData.image,
          };
          
          console.log('🔄 AuthContext: Updating NextAuth session...', sessionUpdateData);
          
          // Force update the session with new data
          await updateSession(sessionUpdateData);
          console.log('✅ AuthContext: Session updated successfully');
          
          // 🔥 Additional session refresh to ensure persistence
          // Wait a bit and trigger another update to ensure it sticks
          setTimeout(async () => {
            try {
              // Trigger a session refetch from the server
              await updateSession();
              console.log('✅ AuthContext: Session double-refresh completed');
            } catch (retryError) {
              console.warn('⚠️ AuthContext: Session retry refresh failed:', retryError);
            }
          }, 500); // Increased delay for better reliability
          
        } catch (sessionError) {
          console.error('❌ AuthContext: Session update failed:', sessionError);
          // Don't fail the entire operation if session update fails
          // The context state is already updated, which is most important
        }
      }
      
      // 🔥 Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('userUpdated', { 
        detail: newUser 
      }));
      
      // 🔥 Force a page refresh event for components that might not be listening
      window.dispatchEvent(new CustomEvent('storage', {
        detail: { key: 'user-updated', newValue: JSON.stringify(newUser) }
      }));
      
      return true;
    } catch (error) {
      console.error('❌ AuthContext: Failed to update user data:', error);
      return false;
    }
  };

  // 🔥 Function to force refresh user data from session
  const refreshUser = async () => {
    try {
      console.log('🔄 AuthContext: Force refreshing user data...');
      
      // Force session refresh first - this will fetch latest data from server
      const refreshedSession = await updateSession();
      console.log('🔄 AuthContext: Session refreshed', refreshedSession);
      
      // The useEffect will automatically update the user state when session changes
      // But we can also manually trigger it if needed
      if (refreshedSession?.user) {
        const refreshedUser = {
          _id: refreshedSession.user._id || refreshedSession.user.id,
          id: refreshedSession.user._id || refreshedSession.user.id,
          username: refreshedSession.user.username || refreshedSession.user.name?.replace(/\s/g, '').toLowerCase(),
          email: refreshedSession.user.email,
          avatar: refreshedSession.user.avatar || refreshedSession.user.image,
          image: refreshedSession.user.avatar || refreshedSession.user.image,
          name: refreshedSession.user.name,
          bio: refreshedSession.user.bio || '',
          emailNotifications: refreshedSession.user.emailNotifications !== false,
          provider: refreshedSession.user.provider || 'google',
          createdAt: refreshedSession.user.createdAt,
          updatedAt: refreshedSession.user.updatedAt,
        };
        
        setUser(refreshedUser);
        console.log('✅ AuthContext: User data force refreshed');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ AuthContext: Force refresh failed:', error);
      return false;
    }
  };

  const loginWithGoogle = () => signIn('google')
    
  const logout = async () => {
    console.log('🚪 AuthContext: Logging out user...');
    setUser(null);
    await signOut({ callbackUrl: '/' });
  }

  const contextValue = {
    user,
    loading,
    loginWithGoogle,
    logout,
    setUser,
    updateUser, // Enhanced function for updating user data
    refreshUser, // Function to force refresh user data
    session,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}