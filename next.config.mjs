/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**', // Google avatars
      },
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io',
        pathname: '/v1/storage/buckets/**', // Appwrite storage paths
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        // pathname: '/v1/storage/buckets/**', // Appwrite storage paths
      },
    ],
  },
};

export default nextConfig;
