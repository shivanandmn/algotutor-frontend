/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    // Explicitly enable type stripping to remove warning
    typedRoutes: true,
  },
};

export default nextConfig;
