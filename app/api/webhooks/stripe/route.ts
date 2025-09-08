import { NextRequest, NextResponse } from 'next/server'
import { stripe, stripeConfig } from '@/lib/stripe/config'
import { headers } from 'next/headers'
import { GraphQLClient } from 'graphql-request'
import Stripe from 'stripe'

const WORDPRESS_GRAPHQL_URL = process.env.WORDPRESS_API_URL || 'http://localhost/statspro/wp-json/graphql'
const client = new GraphQLClient(WORDPRESS_GRAPHQL_URL)

// We now use WordPress REST API to update user meta and roles instead of GraphQL mutations

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      stripeConfig.webhookSecret
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  console.log('Received Stripe webhook:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id)
  
  if (session.mode === 'subscription' && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    const userId = session.metadata?.userId
    
    if (userId) {
      await createOrUpdateSubscription(subscription, parseInt(userId))
    }
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id)
  
  const invoiceAny = invoice as any
  if (invoiceAny.subscription && typeof invoiceAny.subscription === 'string') {
    const subscription = await stripe.subscriptions.retrieve(invoiceAny.subscription)
    const userId = subscription.metadata?.userId
    
    if (userId) {
      await updateUserSubscription(parseInt(userId), 'pro_subscriber', {
        subscription_status: 'active'
      })
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id)
  
  const invoiceAny = invoice as any
  if (invoiceAny.subscription && typeof invoiceAny.subscription === 'string') {
    const subscription = await stripe.subscriptions.retrieve(invoiceAny.subscription)
    const userId = subscription.metadata?.userId
    
    if (userId) {
      await updateUserSubscription(parseInt(userId), 'free_subscriber', {
        subscription_status: 'past_due'
      })
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id)
  
  const userId = subscription.metadata?.userId
  if (userId) {
    await createOrUpdateSubscription(subscription, parseInt(userId))
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)
  
  const userId = subscription.metadata?.userId
  if (userId) {
    await updateUserSubscription(parseInt(userId), 'free_subscriber', {
      subscription_status: 'cancelled'
    })
  }
}

async function createOrUpdateSubscription(subscription: Stripe.Subscription, userId: number) {
  try {
    // Get the subscription plan based on Stripe price ID
    const priceId = subscription.items.data[0]?.price.id
    let planType = 'free'
    
    // Map Stripe price IDs to plan types
    if (priceId === 'price_1S3DSRGRLsNELyji8NFmz2k3') {
      planType = 'pro'
    } else if (priceId === 'price_1S3DSxGRLsNELyji4cmzzijM') {
      planType = 'enterprise'
    }

    // Determine user role based on subscription status and plan
    const role = subscription.status === 'active' ? `${planType}_subscriber` : 'subscriber'

    // Update user subscription data using custom WordPress plugin endpoint
    await updateUserSubscription(userId, role, {
      subscription_status: subscription.status,
      subscription_plan: planType,
      stripe_subscription_id: subscription.id,
      subscription_start_date: new Date((subscription as any).start_date * 1000).toISOString(),
      subscription_end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
    })

    console.log(`Updated user ${userId} subscription: ${planType} (${subscription.status}) with role: ${role}`)

  } catch (error) {
    console.error('Error creating/updating subscription:', error)
  }
}

async function updateSubscriptionStatus(stripeSubscriptionId: string, status: string) {
  try {
    // This function is now handled by updateUserMeta in createOrUpdateSubscription
    console.log(`Subscription ${stripeSubscriptionId} status updated to: ${status}`)
  } catch (error) {
    console.error('Error updating subscription status:', error)
  }
}

async function updateUserSubscription(userId: number, role: string, subscriptionData: Record<string, string>) {
  try {
    console.log(`Updating user ${userId} subscription: role=${role}, data=`, subscriptionData)
    
    // Use custom WordPress REST API endpoint for complete subscription update
    const response = await fetch(`${process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json'}/statspro/v1/update-user-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_ADMIN_USER}:${process.env.WORDPRESS_ADMIN_PASS}`).toString('base64')}`
      },
      body: JSON.stringify({
        user_id: userId,
        role: role,
        subscription_data: subscriptionData
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to update user subscription via custom endpoint:', response.status, response.statusText, errorText)
      
      // If custom endpoint fails, it might be because the plugin isn't installed
      console.log('❌ Custom endpoint failed. Please ensure WordPress plugin is installed and activated.')
      console.log('📁 Plugin location: wp-content/plugins/statspro-subscription/statspro-subscription.php')
      console.log('🔧 Activate it in WordPress admin: Plugins → Installed Plugins')
    } else {
      const result = await response.json()
      console.log(`✅ Successfully updated user ${userId} subscription:`, result)
    }
  } catch (error) {
    console.error('Error updating user subscription:', error)
  }
}

// Legacy functions kept for compatibility
async function updateUserMeta(userId: number, metaData: Record<string, string>) {
  console.log('⚠️  updateUserMeta is deprecated, using updateUserSubscription instead')
  await updateUserSubscription(userId, 'subscriber', metaData)
}

async function updateUserRole(userId: number, role: string) {
  console.log('⚠️  updateUserRole is deprecated, using updateUserSubscription instead')
  await updateUserSubscription(userId, role, {})
}

// These functions are no longer needed as we're using WordPress user meta instead of custom post types
