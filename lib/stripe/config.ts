import Stripe from 'stripe'

// Initialize Stripe with correct API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
} as any)

// Stripe configuration
export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  currency: 'usd',
}

// Subscription plans configuration
export const subscriptionPlans = {
  free: {
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '3 team pages per day',
      '5 matchup pages per day',
      '10 API requests per hour',
      'Basic analytics'
    ],
    limits: {
      apiRateLimit: 10,
      teamLimit: 3,
      matchupLimit: 5
    }
  },
  pro: {
    name: 'Pro',
    productId: process.env.STRIPE_PRO_PRODUCT_ID!,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 29.99,
    interval: 'month',
    features: [
      'Unlimited team pages',
      'Unlimited matchup pages',
      '1000 API requests per hour',
      'Advanced analytics',
      'Premium predictions',
      'Email support'
    ],
    limits: {
      apiRateLimit: 1000,
      teamLimit: -1,
      matchupLimit: -1
    }
  },
  enterprise: {
    name: 'Enterprise',
    productId: process.env.STRIPE_ENTERPRISE_PRODUCT_ID!,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    price: 99.99,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Custom integrations',
      'Priority support',
      'Custom analytics',
      'White-label options'
    ],
    limits: {
      apiRateLimit: 5000,
      teamLimit: -1,
      matchupLimit: -1
    }
  }
}

// Get plan by priceId safely
export function getPlanByPriceId(priceId: string) {
  return Object.values(subscriptionPlans).find(
    (plan) => 'priceId' in plan && plan.priceId === priceId
  )
}

// Helper function to format price
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}
