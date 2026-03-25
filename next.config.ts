import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow ngrok (or other) hosts to access dev-only `/_next/*` assets.
  // Update this list to match your actual dev tunnel hostname(s).
  allowedDevOrigins: ["8e86-105-155-62-199.ngrok-free.app"],
};

export default nextConfig;
