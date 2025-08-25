const axios = require('axios');

/**
 * Daily Automation Script
 * Run this script daily via cron job to send emails and post to social media
 */

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

async function runDailyAutomation() {
  console.log('Starting daily automation...');
  
  try {
    // Send daily email
    console.log('Sending daily email...');
    const emailResponse = await axios.post(`${BASE_URL}/api/automation/email`, {
      action: 'send_daily'
    });
    
    if (emailResponse.data.success) {
      console.log('✅ Daily email sent successfully');
    } else {
      console.error('❌ Failed to send daily email');
    }

    // Publish social media posts
    console.log('Publishing social media posts...');
    const socialResponse = await axios.post(`${BASE_URL}/api/automation/social`, {
      action: 'publish_daily'
    });
    
    if (socialResponse.data.success) {
      console.log('✅ Social media posts published successfully');
    } else {
      console.error('❌ Failed to publish social media posts');
    }

    console.log('Daily automation completed successfully');
    
  } catch (error) {
    console.error('❌ Daily automation failed:', error.message);
    process.exit(1);
  }
}

// Run the automation
runDailyAutomation();