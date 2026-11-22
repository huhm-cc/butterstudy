import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // libsql 的原生/網路實作留在 Node runtime,不打進 bundle
  serverExternalPackages: [
    "@libsql/client",
    "@libsql/hrana-client",
    "@libsql/isomorphic-fetch",
    "@libsql/isomorphic-ws",
    "libsql",
  ],
  // 建置使用 Turbopack(此環境的虛擬檔案系統對 webpack 的 readlink 不友好)
  // 若在一般環境想用 webpack:把 package.json 的 build 改成 `next build`
};

export default nextConfig;