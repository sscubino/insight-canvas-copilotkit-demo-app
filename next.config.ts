import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@copilotkit/react-core",
    "@copilotkit/react-ui",
    "@ag-ui/mastra",
  ],
  serverExternalPackages: ["@mastra/core", "@mastra/memory", "@mastra/libsql"],
};

export default nextConfig;
