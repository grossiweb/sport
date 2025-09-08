#!/usr/bin/env node

/**
 * WordPress Setup Verification Script
 * Checks if WordPress integration is working properly
 */

const https = require('https');
const http = require('http');

// Configuration
const WORDPRESS_URL = process.env.WORDPRESS_API_URL || 'http://localhost/statspro/graphql';
const WORDPRESS_REST_URL = process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json';
const NEXTJS_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

console.log('🔍 Verifying WordPress Package Feature Control Setup...\n');

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function checkWordPressAPI() {
  console.log('1. 🔍 Checking WordPress REST API...');
  
  try {
    const response = await makeRequest(`${WORDPRESS_REST_URL}/wp/v2/types`);
    
    if (response.status === 200) {
      console.log('   ✅ WordPress REST API is accessible');
      
      // Check for subscription_plan post type
      if (response.data.subscription_plan) {
        console.log('   ✅ Subscription Plan post type is registered');
      } else {
        console.log('   ❌ Subscription Plan post type not found');
        console.log('   💡 Make sure StatsPro Subscriptions plugin is activated');
      }
    } else {
      console.log(`   ❌ WordPress REST API error: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Cannot connect to WordPress: ${error.message}`);
    console.log('   💡 Make sure WAMP server is running and WordPress is accessible');
  }
}

async function checkGraphQLAPI() {
  console.log('\n2. 🔍 Checking WordPress GraphQL API...');
  
  const query = `
    query {
      subscriptionPlans {
        nodes {
          id
          title
        }
      }
    }
  `;
  
  try {
    const response = await makeRequest(WORDPRESS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });
    
    if (response.status === 200 && !response.data.errors) {
      console.log('   ✅ GraphQL API is working');
      
      const plans = response.data?.data?.subscriptionPlans?.nodes || [];
      console.log(`   📊 Found ${plans.length} subscription plans`);
      
      plans.forEach((plan, index) => {
        console.log(`   ${index + 1}. ${plan.title} (ID: ${plan.id})`);
      });
    } else {
      console.log('   ❌ GraphQL API error');
      if (response.data.errors) {
        response.data.errors.forEach(error => {
          console.log(`   📝 ${error.message}`);
        });
      }
    }
  } catch (error) {
    console.log(`   ❌ GraphQL connection error: ${error.message}`);
  }
}

async function checkSubscriptionPlans() {
  console.log('\n3. 🔍 Checking Subscription Plans...');
  
  try {
    const response = await makeRequest(`${WORDPRESS_REST_URL}/wp/v2/subscription_plan`);
    
    if (response.status === 200) {
      console.log(`   ✅ Found ${response.data.length} subscription plans`);
      
      response.data.forEach((plan, index) => {
        console.log(`   ${index + 1}. ${plan.title.rendered} (ID: ${plan.id})`);
      });
      
      if (response.data.length === 0) {
        console.log('   💡 No subscription plans found. Create some plans in WordPress admin.');
      }
    } else {
      console.log(`   ❌ Error fetching subscription plans: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Connection error: ${error.message}`);
  }
}

async function checkNextJSIntegration() {
  console.log('\n4. 🔍 Checking Next.js Integration...');
  
  try {
    // Check if Next.js app is running
    const response = await makeRequest(`${NEXTJS_URL}/api/admin/packages`);
    
    if (response.status === 401) {
      console.log('   ✅ Next.js admin packages endpoint is accessible (requires auth)');
    } else if (response.status === 200) {
      console.log('   ✅ Next.js admin packages endpoint is working');
    } else {
      console.log(`   ❌ Next.js endpoint error: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Cannot connect to Next.js app: ${error.message}`);
    console.log('   💡 Make sure Next.js app is running on http://localhost:3001');
  }
}

async function checkEnvironmentVariables() {
  console.log('\n5. 🔍 Checking Environment Variables...');
  
  const requiredVars = [
    'WORDPRESS_API_URL',
    'WORDPRESS_REST_URL', 
    'WORDPRESS_ADMIN_USER',
    'WORDPRESS_ADMIN_PASS'
  ];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`   ✅ ${varName} is set`);
    } else {
      console.log(`   ❌ ${varName} is missing`);
      console.log(`   💡 Add ${varName} to your .env.local file`);
    }
  });
}

async function generateTestData() {
  console.log('\n6. 🔧 Test Data Suggestions...');
  
  console.log(`
   📋 To complete the setup, create these subscription plans in WordPress:

   🆓 Free Plan:
   - Price: $0/month
   - API Limit: 10/hour
   - Teams: 3
   - Matchups: 5

   💎 Pro Plan: 
   - Price: $29.99/month
   - API Limit: 100/hour
   - Teams: 25
   - Matchups: 50

   🏢 Enterprise Plan:
   - Price: $99.99/month  
   - API Limit: 1000/hour
   - Teams: 100
   - Matchups: 200

   📝 Steps:
   1. Go to WordPress Admin → Subscription Plans → Add New
   2. Fill in the plan details and custom fields
   3. Publish each plan
   4. Create test user subscriptions in User Subscriptions
   5. Assign proper roles to test users (free_subscriber, pro_subscriber, etc.)
  `);
}

async function main() {
  await checkEnvironmentVariables();
  await checkWordPressAPI();
  await checkGraphQLAPI();
  await checkSubscriptionPlans();
  await checkNextJSIntegration();
  await generateTestData();
  
  console.log('\n✨ WordPress Package Feature Control Verification Complete!');
  console.log('\n📚 For detailed setup instructions, see: wordpress-setup-guide.md');
}

// Run the verification
main().catch(console.error);
