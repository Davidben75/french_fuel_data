import { loadEnvConfig } from "@next/env"
import type { NextConfig } from "next"
import path from "path"

loadEnvConfig(path.resolve(__dirname, "../.."))
const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

export default nextConfig
