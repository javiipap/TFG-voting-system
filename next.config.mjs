/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack(config, { isServer, dev }) {
    // Use the client static directory in the server bundle and prod mode
    // Fixes `Error occurred prerendering page "/"`
    config.experiments.asyncWebAssembly = true;
    config.experiments.syncWebAssembly = true;

    return config;
  },
};

export default nextConfig;
