import Stripe from 'stripe'

// Initialize Stripe with correct API version
export const stripe = new Stripe('sk_test_51SmHsWBsfc1fMnM5XcAFKo4HPyAdh7oVk5IdiRtHCb2dMuRhMe63QxAgzWpHLhA41pzTIM1gaj7vbd74KlyZKFWF00awWcDmsF'!, {
  apiVersion: '2023-10-16',
} as any)

// Stripe configuration
export const stripeConfig = {
  publishableKey: 'pk_test_51SmHsWBsfc1fMnM5iS0W3mNjxRK2wn1BBkeyHr8or8umyDbpiSg7E0p9AZY3bIhyqaL5eEGDqs2BDa5qqxSf1bXn00t72v7OcM'!,
  secretKey: 'sk_test_51SmHsWBsfc1fMnM5XcAFKo4HPyAdh7oVk5IdiRtHCb2dMuRhMe63QxAgzWpHLhA41pzTIM1gaj7vbd74KlyZKFWF00awWcDmsF'!,
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
    productId: 'prod_Tk111AdNojfJdZ',
    priceId: 'price_1SmWzsBsfc1fMnM5lpwnHNJT',
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
    productId: 'prod_Tk116wbfmvhkOo',
    priceId: 'price_1SmWzWBsfc1fMnM57LdsAiqR',
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
