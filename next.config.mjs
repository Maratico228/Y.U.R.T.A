/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Добавь это:
  serverRuntimeConfig: {
    port: process.env.PORT || 3000,
  },
};
export default nextConfig;
