import { NextRequest, NextResponse } from 'next/server'

// WordPress REST API endpoint for managing subscription packages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'

    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    switch (action) {
      case 'list':
        return await getSubscriptionPlans(token)
      case 'get':
        const planId = searchParams.get('id')
        if (!planId) {
          return NextResponse.json(
            { error: 'Plan ID is required' },
            { status: 400 }
          )
        }
        return await getSubscriptionPlan(token, planId)
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Packages API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const packageData = await request.json()

    return await createSubscriptionPlan(token, packageData)
  } catch (error) {
    console.error('Create package error:', error)
    return NextResponse.json(
      { error: 'Failed to create package' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const packageData = await request.json()

    if (!packageData.id) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      )
    }

    return await updateSubscriptionPlan(token, packageData.id, packageData)
  } catch (error) {
    console.error('Update package error:', error)
    return NextResponse.json(
      { error: 'Failed to update package' },
      { status: 500 }
    )
  }
}

async function getSubscriptionPlans(token: string) {
  try {
    const response = await fetch(`${process.env.WORDPRESS_REST_URL}/wp/v2/subscription_plan?_fields=id,title,acf&status=publish`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`)
    }

    const plans = await response.json()
    
    const formattedPlans = plans.map((plan: any) => ({
      id: plan.id,
      name: plan.title.rendered,
      planName: plan.acf?.plan_name || plan.title.rendered,
      price: plan.acf?.plan_price || 0,
      interval: plan.acf?.plan_interval || 'month',
      stripePriceId: plan.acf?.stripe_price_id || '',
      apiRateLimit: plan.acf?.api_rate_limit || 10,
      teamLimit: plan.acf?.team_limit || 3,
      matchupLimit: plan.acf?.matchup_limit || 5,
      features: plan.acf?.features ? plan.acf.features.split('\n').filter((f: string) => f.trim()) : []
    }))

    return NextResponse.json({
      success: true,
      data: formattedPlans
    })
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    )
  }
}

async function getSubscriptionPlan(token: string, planId: string) {
  try {
    const response = await fetch(`${process.env.WORDPRESS_REST_URL}/wp/v2/subscription_plan/${planId}?_fields=id,title,acf`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`)
    }

    const plan = await response.json()
    
    const formattedPlan = {
      id: plan.id,
      name: plan.title.rendered,
      planName: plan.acf?.plan_name || plan.title.rendered,
      price: plan.acf?.plan_price || 0,
      interval: plan.acf?.plan_interval || 'month',
      stripePriceId: plan.acf?.stripe_price_id || '',
      apiRateLimit: plan.acf?.api_rate_limit || 10,
      teamLimit: plan.acf?.team_limit || 3,
      matchupLimit: plan.acf?.matchup_limit || 5,
      features: plan.acf?.features ? plan.acf.features.split('\n').filter((f: string) => f.trim()) : []
    }

    return NextResponse.json({
      success: true,
      data: formattedPlan
    })
  } catch (error) {
    console.error('Error fetching subscription plan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription plan' },
      { status: 500 }
    )
  }
}

async function createSubscriptionPlan(token: string, packageData: any) {
  try {
    // Create the post first
    const postResponse = await fetch(`${process.env.WORDPRESS_REST_URL}/wp/v2/subscription_plan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: packageData.planName,
        status: 'publish',
        content: packageData.description || ''
      })
    })

    if (!postResponse.ok) {
      throw new Error(`WordPress API error: ${postResponse.status}`)
    }

    const post = await postResponse.json()

    // Update ACF fields
    const acfData = {
      plan_name: packageData.planName,
      plan_price: packageData.price,
      plan_interval: packageData.interval,
      stripe_price_id: packageData.stripePriceId,
      api_rate_limit: packageData.apiRateLimit,
      team_limit: packageData.teamLimit,
      matchup_limit: packageData.matchupLimit,
      features: Array.isArray(packageData.features) ? packageData.features.join('\n') : packageData.features
    }

    const acfResponse = await fetch(`${process.env.WORDPRESS_REST_URL}/acf/v3/subscription_plan/${post.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: acfData })
    })

    if (!acfResponse.ok) {
      console.warn('Failed to update ACF fields:', acfResponse.status)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: post.id,
        ...packageData
      }
    })
  } catch (error) {
    console.error('Error creating subscription plan:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription plan' },
      { status: 500 }
    )
  }
}

async function updateSubscriptionPlan(token: string, planId: string, packageData: any) {
  try {
    // Update the post
    const postResponse = await fetch(`${process.env.WORDPRESS_REST_URL}/wp/v2/subscription_plan/${planId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: packageData.planName,
        content: packageData.description || ''
      })
    })

    if (!postResponse.ok) {
      throw new Error(`WordPress API error: ${postResponse.status}`)
    }

    // Update ACF fields
    const acfData = {
      plan_name: packageData.planName,
      plan_price: packageData.price,
      plan_interval: packageData.interval,
      stripe_price_id: packageData.stripePriceId,
      api_rate_limit: packageData.apiRateLimit,
      team_limit: packageData.teamLimit,
      matchup_limit: packageData.matchupLimit,
      features: Array.isArray(packageData.features) ? packageData.features.join('\n') : packageData.features
    }

    const acfResponse = await fetch(`${process.env.WORDPRESS_REST_URL}/acf/v3/subscription_plan/${planId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: acfData })
    })

    if (!acfResponse.ok) {
      console.warn('Failed to update ACF fields:', acfResponse.status)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: planId,
        ...packageData
      }
    })
  } catch (error) {
    console.error('Error updating subscription plan:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription plan' },
      { status: 500 }
    )
  }
}
