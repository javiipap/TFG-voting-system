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
  // env: {
  //   DB_USER: process.env.DB_USER,
  //   DB_PWD: process.env.DB_PWD,
  //   DB_NAME: process.env.DB_NAME,
  //   DB_HOST: process.env.DB_HOST,
  //   DB_PORT: process.env.DB_PORT,
  //   AUTH_SECRET: process.env.AUTH_SECRET,
  //   ETH_ACCOUNT: process.env.ETH_ACCOUNT,
  //   ETH_PRIV: process.env.ETH_PRIV,
  //   NEXT_PUBLIC_ETH_HOSTS: process.env.NEXT_PUBLIC_ETH_HOSTS,
  //   NEXT_PUBLIC_AUTH_PROXY: process.env.NEXT_PUBLIC_AUTH_PROXY,
  //   NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
  // },
};

export default nextConfig;
