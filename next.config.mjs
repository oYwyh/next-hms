/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["@node-rs/argon2"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: 'pub-83a0439801fb44dc8ab4de19e88770c6.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  }
};

export default nextConfig;