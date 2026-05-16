import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Permite que o build termine mesmo com erros de tipagem.
    // Útil para ambientes com bibliotecas beta/experimental.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora erros de lint no build também para acelerar.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
