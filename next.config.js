/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained server bundle (.next/standalone) so the Docker
  // production image only needs the traced node_modules, not the full tree.
  output: 'standalone',
  // The app runs behind Nginx Proxy Manager which terminates TLS and forwards
  // the original host/proto via X-Forwarded-* headers.
  poweredByHeader: false,
}

module.exports = nextConfig
