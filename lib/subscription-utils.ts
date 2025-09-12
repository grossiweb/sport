/**
 * Centralized subscription utilities for WordPress role mapping
 * This ensures consistent subscription status determination across all auth endpoints
 */

export interface WordPressRole {
  name: string
}

export type SubscriptionTier = 'free' | 'pro' | 'enterprise' | 'trial' | 'unknown'

/**
 * Determines subscription status based on WordPress roles
 * Supports your specific subscription system: free_subscriber, pro_subscriber, enterprise_subscriber
 */
export function determineSubscriptionStatus(roles: WordPressRole[]): 'active' | 'inactive' | 'trial' {
  const roleNames = roles.map(role => role.name.toLowerCase())
  
  // Log roles for debugging
  console.log('Checking subscription status for roles:', roleNames)
  
  // Your specific active subscription roles
  const activeRoles = [
    'pro_subscriber',        // Paid pro subscription
    'enterprise_subscriber', // Enterprise subscription
    // Keep some common ones for compatibility
    'premium_member',
    'subscriber', 
    'paid_member',
    'premium',
    'pro',
    'member',
    'vip',
    'paid',
    'premium_subscriber',
    'pro_member',
    'active_subscriber',
    'paid_subscriber'
  ]
  
  const freeRoles = [
    'free_subscriber'        // Your free subscription role
  ]
  
  const trialRoles = [
    'trial_member',
    'trial',
    'free_trial',
    'trial_subscriber'
  ]
  
  // Check for active (paid) subscription
  const hasActiveRole = activeRoles.some(role => roleNames.includes(role))
  if (hasActiveRole) {
    console.log('User has active (paid) subscription role')
    return 'active'
  }
  
  // Check for free subscriber (limited access)
  const hasFreeRole = freeRoles.some(role => roleNames.includes(role))
  if (hasFreeRole) {
    console.log('User has free subscription role')
    return 'trial' // Treat free subscribers as trial for access control
  }
  
  // Check for trial subscription
  const hasTrialRole = trialRoles.some(role => roleNames.includes(role))
  if (hasTrialRole) {
    console.log('User has trial subscription role')
    return 'trial'
  }
  
  console.log('User has no recognized subscription role, defaulting to trial')
  return 'trial' // Default to trial to avoid blocking access
}

/**
 * Gets subscription expiry date based on WordPress roles
 */
export function getSubscriptionExpiry(roles: WordPressRole[]): Date | undefined {
  const roleNames = roles.map(role => role.name.toLowerCase())
  
  const trialRoles = ['trial_member', 'trial', 'free_trial', 'trial_subscriber']
  const freeRoles = ['free_subscriber']
  const activeRoles = ['pro_subscriber', 'enterprise_subscriber', 'premium_member', 'subscriber', 'paid_member', 'premium', 'pro', 'member', 'vip', 'paid', 'premium_subscriber', 'pro_member', 'active_subscriber', 'paid_subscriber']
  
  // Trial users get 14-day expiry
  if (trialRoles.some(role => roleNames.includes(role))) {
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 14) // 14 day trial
    console.log('Trial user, setting expiry to:', expiry)
    return expiry
  }
  
  // Free subscribers get limited access (no expiry but limited features)
  if (freeRoles.some(role => roleNames.includes(role))) {
    // Free subscribers don't expire but have limited access
    // You can set an expiry if you want to encourage upgrades
    console.log('Free subscriber, no expiry (limited access)')
    return undefined // No expiry for free users
  }
  
  // Active (paid) subscribers get no expiry
  if (activeRoles.some(role => roleNames.includes(role))) {
    // Return far future date for active subscribers
    const farFuture = new Date()
    farFuture.setFullYear(farFuture.getFullYear() + 10) // 10 years from now
    console.log('Active (paid) subscriber, setting expiry to far future:', farFuture)
    return farFuture
  }
  
  console.log('No specific expiry set for user roles')
  return undefined
}

/**
 * Checks if a user has an active subscription based on status and expiry
 * For your system: active = pro/enterprise, trial = free_subscriber + trials
 */
export function hasActiveSubscription(subscriptionStatus: 'active' | 'inactive' | 'trial', subscriptionExpiry?: Date): boolean {
  if (subscriptionStatus === 'active') {
    if (subscriptionExpiry) {
      const isNotExpired = new Date() < new Date(subscriptionExpiry)
      console.log('Active (paid) subscription, expired?', !isNotExpired)
      return isNotExpired
    }
    console.log('Active (paid) subscription with no expiry')
    return true
  }
  
  if (subscriptionStatus === 'trial') {
    // This includes both free_subscriber and actual trial users
    if (subscriptionExpiry) {
      const isNotExpired = new Date() < new Date(subscriptionExpiry)
      console.log('Trial/Free subscription, expired?', !isNotExpired)
      return isNotExpired
    }
    console.log('Trial/Free subscription with no expiry, allowing access')
    return true // Allow access for free subscribers
  }
  
  console.log('Inactive subscription')
  return false
}

/**
 * Gets user subscription tier for display purposes
 */
export function getSubscriptionTier(roles: WordPressRole[]): 'free' | 'pro' | 'enterprise' | 'trial' | 'unknown' {
  const roleNames = roles.map(role => role.name.toLowerCase())
  
  if (roleNames.includes('enterprise_subscriber')) {
    return 'enterprise'
  }
  if (roleNames.includes('pro_subscriber')) {
    return 'pro'
  }
  if (roleNames.includes('free_subscriber')) {
    return 'free'
  }
  if (roleNames.some(role => ['trial_member', 'trial', 'free_trial', 'trial_subscriber'].includes(role))) {
    return 'trial'
  }
  
  return 'unknown'
}
