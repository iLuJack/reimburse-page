import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wtvbzcsnnueygcxfjsqf.supabase.co",
        port: "",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;
