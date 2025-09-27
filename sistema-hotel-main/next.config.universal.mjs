/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração condicional baseada no modo
  ...(process.env.NEXT_CONFIG_MODE === 'export' ? {
    output: 'export',
    distDir: 'out',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    images: {
      unoptimized: true
    }
  } : {
    // Configuração para servidor (Vercel, Railway, Render)
    trailingSlash: true,
    images: {
      unoptimized: true,
      domains: ['localhost', 'supabase.co']
    }
  }),
  
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'contexts', 'hooks', 'lib']
  },
  
  typescript: {
    ignoreBuildErrors: true, // Temporário para resolver problemas de tipos
  },
  
  // Configurações para build
  webpack: (config, { isServer }) => {
    // Excluir pasta api do webpack
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/api/**', '**/node_modules/**']
    }
    
    // Análise de bundle
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      )
    }
    
    return config
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/',
        permanent: false,
      }
    ]
  },
  
  // Configuração experimental
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  }
}

export default nextConfig