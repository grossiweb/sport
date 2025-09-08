import { NextRequest, NextResponse } from 'next/server'

// Setup endpoint to create custom WordPress roles for subscription plans
export async function POST(request: NextRequest) {
  try {
    console.log('Setting up WordPress custom roles...')

    // Define custom roles for subscription plans
    const customRoles = [
      {
        role: 'pro_subscriber',
        display_name: 'Pro Subscriber',
        capabilities: {
          read: true,
          edit_posts: false,
          delete_posts: false,
          upload_files: true,
          level_0: true
        }
      },
      {
        role: 'enterprise_subscriber',
        display_name: 'Enterprise Subscriber', 
        capabilities: {
          read: true,
          edit_posts: false,
          delete_posts: false,
          upload_files: true,
          level_0: true
        }
      },
      {
        role: 'free_subscriber',
        display_name: 'Free Subscriber',
        capabilities: {
          read: true,
          level_0: true
        }
      }
    ]

    const results = []

    // Try to create each role using WordPress REST API
    for (const roleData of customRoles) {
      try {
        // WordPress doesn't have a direct REST API endpoint for creating roles
        // We'll need to use a custom approach or plugin
        
        // For now, let's try to create a user with this role to see if it exists
        const testResponse = await fetch(`${process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json'}/wp/v2/users`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_ADMIN_USER}:${process.env.WORDPRESS_ADMIN_PASS}`).toString('base64')}`
          }
        })

        if (testResponse.ok) {
          results.push({
            role: roleData.role,
            status: 'WordPress REST API accessible',
            message: `Role ${roleData.role} setup would require WordPress admin panel or custom plugin`
          })
        } else {
          results.push({
            role: roleData.role,
            status: 'error',
            message: 'Cannot access WordPress REST API'
          })
        }
      } catch (error: any) {
        results.push({
          role: roleData.role,
          status: 'error',
          message: error.message
        })
      }
    }

    // Test current user role update capability
    let userTestResult = null
    try {
      // Test with a known user ID (3 from your tests)
      const userResponse = await fetch(`${process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json'}/wp/v2/users/3`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_ADMIN_USER}:${process.env.WORDPRESS_ADMIN_PASS}`).toString('base64')}`
        }
      })

      if (userResponse.ok) {
        const userData = await userResponse.json()
        userTestResult = {
          success: true,
          currentRoles: userData.roles,
          message: 'Can access user data successfully'
        }
      } else {
        const errorText = await userResponse.text()
        userTestResult = {
          success: false,
          error: `${userResponse.status} ${userResponse.statusText}`,
          details: errorText
        }
      }
    } catch (error: any) {
      userTestResult = {
        success: false,
        error: error.message
      }
    }

    return NextResponse.json({
      success: true,
      message: 'WordPress roles setup check completed',
      environment: {
        WORDPRESS_REST_URL: process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json',
        WORDPRESS_ADMIN_USER: process.env.WORDPRESS_ADMIN_USER || 'not set',
        hasAdminPass: !!process.env.WORDPRESS_ADMIN_PASS
      },
      roleSetupResults: results,
      userAccessTest: userTestResult,
      instructions: {
        message: 'To create custom roles in WordPress, you need to:',
        steps: [
          '1. Log into WordPress admin panel at http://localhost/statspro/wp-admin',
          '2. Install a role management plugin like "User Role Editor"',
          '3. Create custom roles: pro_subscriber, enterprise_subscriber, free_subscriber',
          '4. Or add this code to your theme\'s functions.php:',
          `
// Add custom roles for subscription plans
function add_subscription_roles() {
    add_role('pro_subscriber', 'Pro Subscriber', array(
        'read' => true,
        'level_0' => true,
    ));
    add_role('enterprise_subscriber', 'Enterprise Subscriber', array(
        'read' => true,
        'level_0' => true,
    ));
    add_role('free_subscriber', 'Free Subscriber', array(
        'read' => true,
        'level_0' => true,
    ));
}
add_action('init', 'add_subscription_roles');
          `
        ]
      }
    })

  } catch (error: any) {
    console.error('WordPress roles setup error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}
