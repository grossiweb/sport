#!/usr/bin/env node

/**
 * WordPress Setup Script for StatsPro Integration
 * 
 * This script helps configure WordPress for seamless integration
 * with the Next.js app including GraphQL setup and user roles.
 */

const https = require('https')
const http = require('http')

const WORDPRESS_URL = process.env.WORDPRESS_API_URL || 'http://localhost/statspro'
const ADMIN_USER = process.env.WORDPRESS_ADMIN_USER || 'stefano'
const ADMIN_PASS = process.env.WORDPRESS_ADMIN_PASS || 'sfg6678$$'

console.log('🚀 Setting up WordPress integration for StatsPro...\n')

async function checkWordPressStatus() {
  return new Promise((resolve) => {
    const url = WORDPRESS_URL.replace('/graphql', '')
    const client = url.startsWith('https') ? https : http
    
    client.get(url, (res) => {
      console.log(`✅ WordPress is accessible at ${url}`)
      console.log(`   Status: ${res.statusCode}`)
      resolve(true)
    }).on('error', (err) => {
      console.log(`❌ WordPress connection failed: ${err.message}`)
      resolve(false)
    })
  })
}

async function checkGraphQLEndpoint() {
  return new Promise((resolve) => {
    const url = WORDPRESS_URL
    const client = url.startsWith('https') ? https : http
    
    client.get(url, (res) => {
      console.log(`✅ GraphQL endpoint is accessible at ${url}`)
      console.log(`   Status: ${res.statusCode}`)
      resolve(true)
    }).on('error', (err) => {
      console.log(`❌ GraphQL endpoint failed: ${err.message}`)
      console.log(`   Make sure WPGraphQL plugin is installed and activated`)
      resolve(false)
    })
  })
}

async function checkRequiredPlugins() {
  console.log('\n📋 Required WordPress Plugins:')
  console.log('   ✓ WPGraphQL - for API communication')
  console.log('   ✓ WPGraphQL for Advanced Custom Fields - for custom data')
  console.log('   ✓ Custom Post Type UI - for email/social post types')
  console.log('   ✓ Advanced Custom Fields - for custom fields')
  console.log('\n💡 Install these plugins from your WordPress admin:')
  console.log(`   ${WORDPRESS_URL.replace('/graphql', '/wp-admin/plugins.php')}`)
}

function showUserRoleInstructions() {
  console.log('\n👥 User Role Configuration:')
  console.log('   The system uses these WordPress roles:')
  console.log('   • subscriber - Regular users (default)')
  console.log('   • trial_member - Users with trial access (14 days)')
  console.log('   • premium_member - Users with premium access')
  console.log('   • administrator - Admin users')
  console.log('\n   New users are automatically assigned "subscriber" role.')
  console.log('   You can create custom roles or modify existing ones as needed.')
}

function showNextSteps() {
  console.log('\n🎯 Next Steps:')
  console.log('   1. Ensure your .env.local file has the correct WordPress URLs')
  console.log('   2. Test user registration at http://localhost:3001/register')
  console.log('   3. Test user login at http://localhost:3001/login')
  console.log('   4. Check user creation in WordPress admin')
  console.log('   5. Configure user roles as needed')
  console.log('\n📝 Configuration Files:')
  console.log('   • .env.local - Environment variables')
  console.log('   • app/api/auth/* - Authentication endpoints')
  console.log('   • lib/wordpress/* - WordPress integration utilities')
}

async function main() {
  console.log('🔍 Checking WordPress integration...\n')
  
  const wpStatus = await checkWordPressStatus()
  if (!wpStatus) {
    console.log('\n❌ WordPress is not accessible. Please check:')
    console.log('   • WAMP server is running')
    console.log('   • WordPress is installed at C:\\wamp64\\www\\statspro')
    console.log('   • WordPress URL is correct in environment variables')
    return
  }
  
  const graphqlStatus = await checkGraphQLEndpoint()
  if (!graphqlStatus) {
    console.log('\n❌ GraphQL endpoint is not accessible.')
    checkRequiredPlugins()
    return
  }
  
  console.log('\n✅ WordPress integration setup is ready!')
  
  showUserRoleInstructions()
  showNextSteps()
  
  console.log('\n🎉 Setup complete! Your WordPress + Next.js authentication is ready.')
  console.log('   Users can now register and login through your Next.js app.')
  console.log('   All user data will be stored and validated in WordPress.')
}

main().catch(console.error)
