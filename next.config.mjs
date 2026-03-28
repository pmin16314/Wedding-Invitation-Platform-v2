/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol:"https", hostname:"res.cloudinary.com", pathname:"/**" },
    ],
  },
  poweredByHeader: false,
  // Fix HMR on Windows — native file watchers don't work reliably on NTFS
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,        // check for changes every 1 second
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options",        value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
      ],
    }];
  },
};
export default nextConfig;
