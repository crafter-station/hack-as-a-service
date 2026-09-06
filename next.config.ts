import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  serverExternalPackages: ["@libsql/client", "@libsql/darwin-arm64"],
};

export default nextConfig;
