'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Upload,
  Heart,
  Download,
  Bookmark,
  Users,
  Eye,
  Calendar,
  Star,
  LayoutGrid,
  TrendingUp,
  Award,
  Pencil,
  Trash2,
  X,
  Save,
  AlertTriangle
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { WallpaperCard } from '@/components/wallpaperCard/WallpaperCard';
import { LoginPopup } from '@/components/loginpopup';
import { FollowButton, FollowerCount, useFollow } from '@/components/FollowSystem';

const CATEGORIES = [
  'Nature',
  'Abstract',
  'Minimalist',
  'Animals',
  'Cityscape',
  'Space',
  'Technology',
  'Fantasy',
  'Textures & Patterns',
  'Food & Drinks',
  'People',
  'Architecture',
  'Cars & Vehicles',
  'Art & Illustration',
  '3D Renders',
  'Typography',
  'Dark',
  'Light',
  'Vintage',
  'Sports',
  'Other'
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingWallpaper, setEditingWallpaper] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    tags: [],
    category: ''
  });
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginActionType, setLoginActionType] = useState('general');

  // Check if this is the current user's profile
  const isOwnProfile = session?.user?.username === (params?.username || session?.user?.username);
  const profileUsername = params?.username || session?.user?.username;

  // ✅ FIX: Use follow system for other users, use profile stats for own profile
  const { isFollowing, followerCount: followSystemFollowerCount } = useFollow(
    !isOwnProfile ? profile?.user?._id : null
  );

  // ✅ FIX: For own profile, use the follower count from profile stats
  const displayFollowerCount = isOwnProfile 
    ? (profile?.stats?.followers || 0) 
    : followSystemFollowerCount;

  useEffect(() => {
    if (status === 'loading') return;

    const fetchProfile = async () => {
      if (!profileUsername) {
        console.warn('⚠️ Username not found');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/profile/${profileUsername}`);
        const data = await res.json();

        console.log('Profile data:', data);
        if (res.ok) {
          console.log('Profile data:', data);
          setProfile(data);
        } else {
          console.error('Profile fetch error:', data);
          setProfile(null);
        }
      } catch (error) {
        console.error('[FETCH_PROFILE_ERROR]', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileUsername, status]);

  const handleEditWallpaper = (wallpaper) => {
    setEditingWallpaper(wallpaper);
    setEditForm({
      title: wallpaper.title || '',
      description: wallpaper.description || '',
      tags: wallpaper.tags || [],
      category: wallpaper.category || ''
    });
  };

  const handleUpdateWallpaper = async () => {
    try {
      const res = await fetch('/api/wallpapers/upload', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingWallpaper._id,
          ...editForm
        })
      });

      if (res.ok) {
        // Update the wallpaper in the profile state
        setProfile(prev => ({
          ...prev,
          wallpapers: prev.wallpapers.map(w =>
            w._id === editingWallpaper._id
              ? { ...w, ...editForm }
              : w
          )
        }));
        setEditingWallpaper(null);
      }
    } catch (error) {
      console.error('Error updating wallpaper:', error);
    }
  };

  const handleDeleteWallpaper = async (wallpaperId) => {
    if (!confirm('Are you sure you want to delete this wallpaper?')) return;

    try {
      const res = await fetch('/api/wallpapers/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: wallpaperId })
      });

      if (res.ok) {
        // Remove the wallpaper from the profile state
        setProfile(prev => ({
          ...prev,
          wallpapers: prev.wallpapers.filter(w => w._id !== wallpaperId)
        }));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting wallpaper:', error);
    }
  };

  const addTag = (tag) => {
    if (tag && !editForm.tags.includes(tag)) {
      setEditForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setEditForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleWallpaperClick = (wallpaper) => {
    router.push(`?wallpaper=${wallpaper._id}`);
  };

  const handleUnauthorizedAction = useCallback((actionType = 'general') => {
    console.log('Unauthorized action triggered:', actionType);
    setLoginActionType(actionType);
    setShowLoginPopup(true);
  }, []);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-gray-200 border-b-purple-500 rounded-full animate-spin animate-reverse"></div>
          </div>
          <div className="text-gray-600 text-lg font-medium">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 shadow-xl">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">This user profile does not exist or is not accessible.</p>
        </div>
      </div>
    );
  }

  // Sort wallpapers by creation date (newest first)
  const sortedWallpapers = [...profile.wallpapers].sort((a, b) =>
    new Date(b.createdAt || b.uploadDate || 0) - new Date(a.createdAt || a.uploadDate || 0)
  );

  return (
    <div className="min-h-screen bg-gray-50" style={{ scrollBehavior: 'smooth' }}>
      <div className="max-w-7xl mx-auto px-1 py-12">
        {/* Profile Header */}
        <div className="relative mb-12">
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl">
           

            <div className="relative flex flex-col md:flex-row items-center gap-8">
              {/* Avatar Section */}
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-gray-200 shadow-lg">
                  <Image
                    src={profile.user.avatar || '/default-avatar.png'}
                    alt={`${profile.user.username}'s avatar`}
                    className="w-full h-full object-cover"
                    width={128}
                    height={128}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Star className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-800 mb-1">
                  {profile.user.username}
                  {isOwnProfile && <span className="text-lg text-gray-500 ml-2">(You)</span>}
                </h1>
                <p className="text-gray-600 text-lg mb-4">{profile.user.email}</p>

                {/* Achievement Badges */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {profile.stats.totalUploads > 10 && (
                    <div className="px-4 py-2 bg-yellow-100 rounded-full border border-yellow-300 flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-600" />
                      <span className="text-yellow-700 text-sm font-medium">Creator</span>
                    </div>
                  )}
                  {profile.stats.totalLikes > 100 && (
                    <div className="px-4 py-2 bg-pink-100 rounded-full border border-pink-300 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-600" />
                      <span className="text-pink-700 text-sm font-medium">Popular</span>
                    </div>
                  )}
                  {displayFollowerCount > 50 && (
                    <div className="px-4 py-2 bg-blue-100 rounded-full border border-blue-300 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-700 text-sm font-medium">Influencer</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Join Date */}
              <div className="text-center">
                <div className="text-gray-500 text-sm mb-1">Member since</div>
                <div className="text-gray-800 font-semibold">
                  {new Date(profile.user.createdAt || Date.now()).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          <StatCard
            icon={<Upload className="w-6 h-6" />}
            label="Uploads"
            value={profile.stats.totalUploads}
            color="blue"
          />
          <StatCard
            icon={<Heart className="w-6 h-6" />}
            label="Likes"
            value={profile.stats.totalLikes}
            color="pink"
          />
          <StatCard
            icon={<Bookmark className="w-6 h-6" />}
            label="Favorites"
            value={profile.stats.totalFavorites}
            color="purple"
          />
          <StatCard
            icon={<Download className="w-6 h-6" />}
            label="Downloads"
            value={profile.stats.totalDownloads}
            color="green"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Followers"
            value={displayFollowerCount}
            color="orange"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Following"
            value={profile.stats.following}
            color="teal"
          />
        </div>

        {/* Wallpapers Section */}
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
              {isOwnProfile ? 'Your Wallpapers' : `${profile.user.username}'s Wallpapers`}
              <span className="text-lg font-normal text-gray-500">({sortedWallpapers.length})</span>
            </h2>

            {/* Follow Button for other users' profiles */}
            {!isOwnProfile && (
              <FollowButton
                userId={profile.user._id}
                onUnauthorizedAction={handleUnauthorizedAction}
                className="w-[15vw]"
                showFollowerCount={false}
              />
            )}
          </div>

          <LoginPopup 
            isVisible={showLoginPopup} 
            onClose={() => setShowLoginPopup(false)} 
            actionType={loginActionType}
          />

          {/* Wallpapers Grid */}
          {sortedWallpapers.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-lg">
              <div className="text-8xl mb-6">🎨</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {isOwnProfile ? 'No wallpapers yet' : 'No wallpapers shared'}
              </h3>
              <p className="text-gray-600 text-lg mb-8">
                {isOwnProfile
                  ? 'Start sharing your amazing wallpapers with the world!'
                  : `${profile.user.username} hasn't shared any wallpapers yet.`
                }
              </p>
            </div>
          ) : (
            <div className="columns-2 gap-1 space-y-1 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-3 xl:gap-3 xl:space-y-3  px-1 md:px-3 sm:px-4 w-full">
              {sortedWallpapers.map((wallpaper, index) => (
                <WallpaperCard
                  key={wallpaper._id}
                  wallpaper={wallpaper}
                  index={index}
                  onUnauthorizedAction={handleUnauthorizedAction}
                  showOwnerActions={isOwnProfile}
                  onEdit={isOwnProfile ? () => handleEditWallpaper(wallpaper) : null}
                  onDelete={isOwnProfile ? () => setDeleteConfirm(wallpaper) : null}
                  onClick={!isOwnProfile ? () => handleWallpaperClick(wallpaper) : null}
                  showUserInfo={false}
                />
              ))}
            </div>
          )}

          {/* Upload More Button - Only for own profile */}
          {isOwnProfile && (
            <div className="mt-8 text-center">
              <button
                onClick={() => router.push('/upload')}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center gap-3 mx-auto"
              >
                <Upload className="w-6 h-6" />
                <span>Upload More Wallpapers</span>
              </button>
            </div>
          )}
        </div>

        {/* Performance Insights */}
        {sortedWallpapers.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              Performance Insights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <InsightCard
                title="Most Popular"
                value={Math.max(...sortedWallpapers.map(w => w.likeCount || 0))}
                subtitle="likes on best wallpaper"
                icon={<Heart className="w-5 h-5" />}
                color="pink"
              />
              <InsightCard
                title="Total Views"
                value={sortedWallpapers.reduce((sum, w) => sum + (w.viewCount || 0), 0)}
                subtitle="across all wallpapers"
                icon={<Eye className="w-5 h-5" />}
                color="blue"
              />
              <InsightCard
                title="Top Download"
                value={Math.max(...sortedWallpapers.map(w => w.downloadCount || 0))}
                subtitle="downloads on best wallpaper"
                icon={<Download className="w-5 h-5" />}
                color="green"
              />
              <InsightCard
                title="Avg. Engagement"
                value={Math.round(sortedWallpapers.reduce((sum, w) => sum + (w.likeCount || 0) + (w.downloadCount || 0), 0) / sortedWallpapers.length) || 0}
                subtitle="likes + downloads per wallpaper"
                icon={<Star className="w-5 h-5" />}
                color="yellow"
              />
            </div>
          </div>
        )}
      </div>

      {/* Edit Wallpaper Modal */}
      {isOwnProfile && editingWallpaper && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Edit Wallpaper</h3>
              <button
                onClick={() => setEditingWallpaper(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter wallpaper title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
                  placeholder="Describe your wallpaper"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category *</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {editForm.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add a tag and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setEditingWallpaper(null)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateWallpaper}
                disabled={!editForm.category || !editForm.title}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isOwnProfile && deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Wallpaper</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{deleteConfirm.title || 'this wallpaper'}"? This action cannot be undone.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteWallpaper(deleteConfirm._id)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Stat Component
function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 border-blue-200 text-blue-600',
    pink: 'bg-pink-100 border-pink-200 text-pink-600',
    purple: 'bg-purple-100 border-purple-200 text-purple-600',
    green: 'bg-green-100 border-green-200 text-green-600',
    orange: 'bg-orange-100 border-orange-200 text-orange-600',
    teal: 'bg-teal-100 border-teal-200 text-teal-600'
  };

  const iconBgClasses = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
    pink: 'bg-gradient-to-r from-pink-500 to-pink-600',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
    green: 'bg-gradient-to-r from-green-500 to-green-600',
    orange: 'bg-gradient-to-r from-orange-500 to-orange-600',
    teal: 'bg-gradient-to-r from-teal-500 to-teal-600'
  };

  return (
    <div className={`relative group bg-white border ${colorClasses[color]} rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <div className={`w-12 h-12 ${iconBgClasses[color]} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>

      <p className="text-3xl font-bold text-gray-800 mb-2 group-hover:scale-110 transition-transform duration-300">
        {Number(value || 0).toLocaleString()}
      </p>
      <p className="text-gray-600 text-sm font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}

// Performance Insight Component
function InsightCard({ title, value, subtitle, icon, color }) {
  const colorClasses = {
    pink: 'bg-gradient-to-r from-pink-500 to-pink-600',
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
    green: 'bg-gradient-to-r from-green-500 to-green-600',
    yellow: 'bg-gradient-to-r from-yellow-500 to-yellow-600'
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 ${colorClasses[color]} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</div>
        </div>
      </div>

      <h4 className="text-gray-800 font-semibold text-lg mb-1">{title}</h4>
      <p className="text-gray-600 text-sm">{subtitle}</p>
    </div>
  );
}