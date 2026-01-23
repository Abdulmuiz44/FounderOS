/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure we can import from outside pages directory if needed
  experimental: {
    // externalDir: true, // simplified
  },
};

export default nextConfig;
