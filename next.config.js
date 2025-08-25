/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'therundown.io', 'sportsdata.io'],
  },
  env: {
    WORDPRESS_API_URL: process.env.WORDPRESS_API_URL || 'http://localhost/statspro/graphql',
    THERUNDOWN_API_KEY: process.env.THERUNDOWN_API_KEY || 'demo-key',
    SPORTSDATA_API_KEY: process.env.SPORTSDATA_API_KEY || 'demo-key',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'development-secret-key',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig