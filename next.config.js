/** @type {import('next').NextConfig} */
const nextConfig = {
  //output: 'export',
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },

  
  reactStrictMode: true,
  env: {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
  },
  
};

module.exports = nextConfig;
