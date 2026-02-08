/**
 * WordPress User Checker
 * 
 * This script checks what users exist in your WordPress installation
 * Run: node scripts/check-wordpress-users.js
 */

// Load environment variables from .env.local
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8')
  envFile.split(/\r?\n/).forEach(line => {
    if (!line.trim() || line.trim().startsWith('#')) return
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      process.env[key] = value
    }
  })
}

const { GraphQLClient } = require('graphql-request')

console.log('\n🔍 Checking WordPress Users...\n')

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || 'http://localhost/statspro/graphql'
const WORDPRESS_REST_URL = process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json'
const ADMIN_USER = process.env.WORDPRESS_ADMIN_USER
const ADMIN_PASS = process.env.WORDPRESS_ADMIN_PASS

console.log('WordPress API:', WORDPRESS_API_URL)
console.log('WordPress REST:', WORDPRESS_REST_URL)
console.log('Admin User:', ADMIN_USER || '❌ Not set')
console.log('')

async function checkUsers() {
  // Method 1: Try GraphQL
  console.log('='.repeat(60))
  console.log('Method 1: GraphQL Query')
  console.log('='.repeat(60))
  
  try {
    const client = new GraphQLClient(WORDPRESS_API_URL)
    
    const query = `
      query GetAllUsers {
        users(first: 100) {
          nodes {
            id
            databaseId
            username
            email
            name
            roles {
              nodes {
                name
              }
            }
          }
        }
      }
    `
    
    const data = await client.request(query)
    
    if (data?.users?.nodes?.length > 0) {
      console.log(`✅ Found ${data.users.nodes.length} users via GraphQL:\n`)
      
      data.users.nodes.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || user.username}`)
        console.log(`   ID: ${user.databaseId}`)
        console.log(`   Username: ${user.username}`)
        console.log(`   Email: ${user.email || 'No email'}`)
        console.log(`   Roles: ${user.roles.nodes.map(r => r.name).join(', ')}`)
        console.log('')
      })
    } else {
      console.log('⚠️ No users returned from GraphQL query')
    }
  } catch (error) {
    console.error('❌ GraphQL query failed:', error.message)
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response, null, 2))
    }
  }
  
  // Method 2: Try REST API
  console.log('\n' + '='.repeat(60))
  console.log('Method 2: REST API')
  console.log('='.repeat(60))
  
  if (!ADMIN_USER || !ADMIN_PASS) {
    console.log('❌ Admin credentials not set in .env.local')
    console.log('   Set WORDPRESS_ADMIN_USER and WORDPRESS_ADMIN_PASS')
    return
  }
  
  try {
    const authString = Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString('base64')
    
    const response = await fetch(`${WORDPRESS_REST_URL}/wp/v2/users`, {
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const users = await response.json()
      console.log(`✅ Found ${users.length} users via REST API:\n`)
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`)
        console.log(`   ID: ${user.id}`)
        console.log(`   Username: ${user.slug}`)
        console.log(`   Email: ${user.email || 'No email'}`)
        console.log(`   Roles: ${user.roles ? user.roles.join(', ') : 'Unknown'}`)
        console.log('')
      })
    } else {
      console.error(`❌ REST API failed: ${response.status} ${response.statusText}`)
      const text = await response.text()
      console.error('Response:', text)
    }
  } catch (error) {
    console.error('❌ REST API request failed:', error.message)
  }
  
  // Method 3: Test specific email
  console.log('\n' + '='.repeat(60))
  console.log('Method 3: Search for Specific Email')
  console.log('='.repeat(60))
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  readline.question('\n📧 Enter email to search for (or press Enter to skip): ', async (searchEmail) => {
    if (searchEmail.trim()) {
      console.log(`\nSearching for: ${searchEmail}\n`)
      
      // Try GraphQL search
      try {
        const client = new GraphQLClient(WORDPRESS_API_URL)
        const query = `
          query SearchUser($email: String!) {
            users(where: { search: $email }) {
              nodes {
                id
                databaseId
                username
                email
                name
              }
            }
          }
        `
        
        const data = await client.request(query, { email: searchEmail })
        
        if (data?.users?.nodes?.length > 0) {
          console.log('✅ GraphQL found:')
          data.users.nodes.forEach(user => {
            console.log(`   - ${user.name} (${user.email})`)
          })
        } else {
          console.log('❌ GraphQL: No users found')
        }
      } catch (error) {
        console.error('❌ GraphQL search failed:', error.message)
      }
      
      // Try REST API search
      if (ADMIN_USER && ADMIN_PASS) {
        try {
          const authString = Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString('base64')
          const response = await fetch(`${WORDPRESS_REST_URL}/wp/v2/users?search=${encodeURIComponent(searchEmail)}`, {
            headers: {
              'Authorization': `Basic ${authString}`
            }
          })
          
          if (response.ok) {
            const users = await response.json()
            if (users.length > 0) {
              console.log('✅ REST API found:')
              users.forEach(user => {
                console.log(`   - ${user.name} (${user.email})`)
              })
            } else {
              console.log('❌ REST API: No users found')
            }
          }
        } catch (error) {
          console.error('❌ REST API search failed:', error.message)
        }
      }
    }
    
    console.log('\n✅ User check complete!\n')
    readline.close()
  })
}

checkUsers().catch(console.error)
