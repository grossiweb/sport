/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'bpheadlessb852.wpenginepowered.com', 'therundown.io', 'sportsdata.io'],
  },
  env: {
    WORDPRESS_API_URL: process.env.WORDPRESS_API_URL || 'http://localhost/statspro/graphql',
    WORDPRESS_REST_URL: process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json',
    THERUNDOWN_API_KEY: process.env.THERUNDOWN_API_KEY || 'efd69980cdmsh7155b43dba58dcdp15c291jsn98c1bb1eaa7a',
    SPORTSDATA_API_KEY: process.env.SPORTSDATA_API_KEY || 'demo-key',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'Nf+ZTxl2y7r1uZz1U1kKk9+VJc4m7Z5H6oE8mQn1jR8=',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3001',
    WORDPRESS_JWT_SECRET: process.env.WORDPRESS_JWT_SECRET || '9f2d1c7d5b9a4e0b91c6a34f7e1db8c4b64e2c7d1a0f9d6c12e3f7a0d1b2c3d4',
    WORDPRESS_JWT_EXPIRE: process.env.WORDPRESS_JWT_EXPIRE || '3600',
    WORDPRESS_ADMIN_USER: process.env.WORDPRESS_ADMIN_USER || 'stefano',
    WORDPRESS_ADMIN_PASS: process.env.WORDPRESS_ADMIN_PASS || 'sfg6678$$',
  },
}

module.exports = nextConfig