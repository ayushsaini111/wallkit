
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import imageCompression from 'browser-image-compression';
import Link from 'next/link';
import { Sparkles, Zap } from 'lucide-react';

const Signup = () => {
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const router = useRouter();

  // Password strength calculation
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user starts typing
  };

  const handleKeyDown = (e) => {
    // Prevent Enter from moving to next input or submitting form
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      setAvatar(compressedFile);
      setAvatarPreview(URL.createObjectURL(compressedFile));
    } catch (error) {
      console.error('Image compression failed:', error);
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation checks
    if (formData.username.length < 2) {
      setError('Username must be at least 2 characters long');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    if (passwordStrength < 2) {
      setError('Please choose a stronger password');
      return;
    }
    
    setLoading(true);

    try {
      const body = new FormData();
      body.append('username', formData.username);
      body.append('email', formData.email);
      body.append('password', formData.password);
      if (avatar) body.append('avatar', avatar);

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        body
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // After signup, immediately log in via NextAuth credentials
        const loginResult = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (loginResult?.ok) {
          router.push('/');    // Now session is set, navbar will update
        } else {
          setError('Account created, but automatic login failed. Please log in manually.');
        }
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      await signIn('google', { callbackUrl: '/' });
    } catch (err) {
      setError('Google authentication failed.');
      setLoading(false);
    }
  };

  return (
    <div className="max-h-screen bg-gradient-to-br pt-30 from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4 relative overflow-y-auto">
      {/* Animated background elements with orange theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-300/30 to-red-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-300/30 to-orange-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-red-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="w-full max-w-lg relative">
        {/* Main card */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden group">
          {/* Card background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 rounded-3xl"></div>
          
          <div className="relative z-10">
            {/* Logo and title with orange theme */}
            <div className="text-center mb-8">
              <div className="relative inline-flex items-center justify-center mb-4 group">
                {/* Main logo container with orange gradient */}
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-xl flex items-center justify-center transform">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                
               
                
                {/* Glow effect */}
                <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500 -z-10" />
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 bg-clip-text text-transparent mb-2">
                Join WallKit
              </h1>
              <p className="text-gray-600">Create your account and start sharing</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Signup form */}
            <form onSubmit={handleSubmit} className="space-y-4  text-gray-800">
              {/* Avatar upload */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Profile Picture (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-200 flex items-center justify-center">
                        <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 transition-colors"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>

              {/* Username field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Username
                  <span className="text-orange-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    required
                    minLength={2}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter your username (min 3 characters)"
                    disabled={loading}
                  />
                </div>
                {formData.username && formData.username.length < 2 && (
                  <p className="text-xs text-blue-600 mt-1">Username must be at least 2 characters</p>
                )}
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Address
                  <span className="text-orange-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                  <span className="text-orange-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    required
                    minLength={6}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-400"
                    placeholder="Create a strong password (min 6 characters)"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464a11.95 11.95 0 00-3.107 3.707m7.021 7.021l-1.414-1.414M15.75 10.5l4.72-4.72a11.95 11.95 0 013.107 3.707M15.75 10.5L8.464 3.227" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength
                              ? strengthColors[passwordStrength - 1]
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${
                      passwordStrength < 3 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      Password strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                    </p>
                    {formData.password.length < 6 && (
                      <p className="text-xs text-blue-600 mt-1">Password must be at least 6 characters</p>
                    )}
                  </div>
                )}
              </div>

              {/* Terms agreement */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 mt-1"
                />
                <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <Link href="/termsCondition" className="text-blue-600 hover:text-blue-700 font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/policy" className="text-blue-600 hover:text-blue-700 font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Sign up button with orange gradient */}
              <button
                type="submit"
                disabled={loading || !agreedToTerms || formData.username.length < 2 || formData.password.length < 6}
                className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white font-semibold py-3.5 rounded-xl hover:from-orange-600 hover:via-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/70 text-gray-500">or</span>
                </div>
              </div>

              {/* Google signup button */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full bg-white/70 hover:bg-white/90 border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-sm hover:shadow-md transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>

            {/* Sign in link */}
            <p className="mt-8 text-center text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-orange-600 hover:text-orange-700 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Floating elements with orange theme */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-400 rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-br from-red-400 to-pink-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 -right-8 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>
    </div>
  );
};

export default Signup;