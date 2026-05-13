import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Multiple lockfiles exist further up the path (this repo is nested
  // inside a workspace that also contains a sibling Dashboard repo).
  // Pin the workspace root to this directory so Turbopack doesn't glob
  // files from outside the project.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
