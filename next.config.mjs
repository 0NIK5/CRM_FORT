/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/CRM_FORT',
  assetPrefix: '/CRM_FORT/',
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
