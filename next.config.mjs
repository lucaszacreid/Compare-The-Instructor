/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["nodemailer", "@upstash/redis"],
  },
};

export default nextConfig;
