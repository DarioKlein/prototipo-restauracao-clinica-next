/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    ...(process.env.REPLIT_DOMAINS?.split(",") ?? []),
  ],
}

export default nextConfig
