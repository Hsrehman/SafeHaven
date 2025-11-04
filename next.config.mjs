/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict mode from main branch
  reactStrictMode: true,


  // Server Actions from dev branch
  experimental: {
    serverActions: {},
  },


  // Environment variables from main branch
  env: {
    TOKEN_EXPIRY: process.env.TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
    OTP_EXPIRY: process.env.OTP_EXPIRY,
  },

  // External packages configuration from main branch
  serverExternalPackages: ['jsonwebtoken'],

  // Public runtime config from main branch
  publicRuntimeConfig: {
    PUBLIC_KEY: process.env.PUBLIC_KEY,
  },
 // Add webpack configuration while keeping existing settings
 webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
      dns: false,
      child_process: false,
      aws4: false,
      'timers/promises': false
    };
  }
  return config;
},
  // CORS headers from dev branch
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

// Using export default (ESM style)
export default nextConfig;