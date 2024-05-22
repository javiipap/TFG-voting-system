import os from 'os';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { isServer, dev }) {
    // Use the client static directory in the server bundle and prod mode
    // Fixes `Error occurred prerendering page "/"`
    config.experiments.asyncWebAssembly = true;
    config.experiments.syncWebAssembly = true;
    config.module.rules.push({
      test: /\.node$/,
      use: [
        {
          loader: 'nextjs-node-loader',
          options: {
            flags: os.constants.dlopen.RTLD_NOW,
            outputPath: config.output.path,
          },
        },
      ],
    });

    return config;
  },
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
