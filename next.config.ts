import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      // Ticket attachments are capped at 5 MB; leave room for multipart overhead.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
