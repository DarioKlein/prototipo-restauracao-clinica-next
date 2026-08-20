/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: process.env.REPLIT_DOMAINS
    ? process.env.REPLIT_DOMAINS.split(",")
    : undefined,
}

export default nextConfig
