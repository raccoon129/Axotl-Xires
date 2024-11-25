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
  
};

module.exports = nextConfig;
