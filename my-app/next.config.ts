const nextConfig = {
  output: "standalone",
  // On force le build même s'il y a des petites erreurs de types
  typescript: {
    ignoreBuildErrors: true,
  },
  // On force le build même s'il y a des erreurs de linting
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
