import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["http://localhost", "http://localhost:80", "http://localhost:3111"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.kiwi.com",
        pathname: "/airlines/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/admin/dashboard",
        permanent: true,
      },
      {
        source: "/dashboard/:path*",
        destination: "/admin/dashboard/:path*",
        permanent: true,
      },
      {
        source: "/users",
        destination: "/admin/users",
        permanent: true,
      },
      {
        source: "/bookings",
        destination: "/admin/bookings",
        permanent: true,
      },
      {
        source: "/bookings/:path*",
        destination: "/admin/bookings/:path*",
        permanent: true,
      },
      {
        source: "/flights",
        destination: "/admin/flights",
        permanent: true,
      },
      {
        source: "/flights/:path*",
        destination: "/admin/flights/:path*",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
