# WordPress Package Feature Control Setup Guide

## Step 5: Create Subscription Plans

### 5.1 Create Free Plan

1. Go to **Subscription Plans → Add New** in WordPress admin
2. **Title**: "Free Plan"
3. Fill in the custom fields:
   - **Plan Name**: Free Plan
   - **Price (USD)**: 0
   - **Billing Interval**: month
   - **Stripe Price ID**: (leave empty for free plan)
   - **API Rate Limit (per hour)**: 10
   - **Team Pages Limit**: 3
   - **Matchup Pages Limit**: 5
   - **Features**: 
     ```
     Basic team statistics
     Limited matchup data
     Community support
     ```
4. **Publish** the plan

### 5.2 Create Pro Plan

1. Go to **Subscription Plans → Add New**
2. **Title**: "Pro Plan"
3. Fill in the custom fields:
   - **Plan Name**: Pro Plan
   - **Price (USD)**: 29.99
   - **Billing Interval**: month
   - **Stripe Price ID**: price_1S3DSRGRLsNELyji8NFmz2k3 (your actual Stripe price ID)
   - **API Rate Limit (per hour)**: 100
   - **Team Pages Limit**: 25
   - **Matchup Pages Limit**: 50
   - **Features**:
     ```
     Advanced team statistics
     Unlimited matchup data
     AI predictions
     Priority support
     Export data
     ```
4. **Publish** the plan

### 5.3 Create Enterprise Plan

1. Go to **Subscription Plans → Add New**
2. **Title**: "Enterprise Plan"
3. Fill in the custom fields:
   - **Plan Name**: Enterprise Plan
   - **Price (USD)**: 99.99
   - **Billing Interval**: month
   - **Stripe Price ID**: price_1S3DSxGRLsNELyji4cmzzijM (your actual Stripe price ID)
   - **API Rate Limit (per hour)**: 1000
   - **Team Pages Limit**: 100
   - **Matchup Pages Limit**: 200
   - **Features**:
     ```
     All Pro features
     Custom integrations
     White-label options
     Dedicated support
     Custom reports
     API access
     ```
4. **Publish** the plan

## Step 6: Assign User Subscriptions

### 6.1 Create User Subscription for Testing

1. Go to **User Subscriptions → Add New**
2. **Title**: "Test User Pro Subscription"
3. Fill in the custom fields:
   - **User ID**: 1 (or your test user ID)
   - **Subscription Plan ID**: Select "Pro Plan" from dropdown
   - **Stripe Subscription ID**: (leave empty for testing)
   - **Status**: active
   - **Start Date**: Today's date
   - **End Date**: One month from today
   - **API Usage Count (Current Hour)**: 0
   - **Last Usage Reset**: Current date/time
4. **Publish** the subscription

## Step 7: Update User Roles

### 7.1 Assign Subscription Roles

1. Go to **Users → All Users**
2. Edit your test user
3. Change **Role** to one of:
   - `free_subscriber` - For free plan users
   - `pro_subscriber` - For pro plan users  
   - `enterprise_subscriber` - For enterprise users

## Step 8: Test the Integration

### 8.1 Test in Next.js App

1. **Login** to your Next.js app at `http://localhost:3001/login`
2. **Check Navigation**: You should now see the correct subscription status (Pro, Free, etc.) instead of "Trial"
3. **Test API Limits**: 
   - Go to team pages - pro users should access more teams
   - Check matchup data - limits should be enforced
   - Monitor console for rate limit headers

### 8.2 Test Admin Package Management

1. **Login as Admin** user in Next.js app
2. **Go to Settings** → **Packages** tab
3. **View Plans**: You should see all your WordPress subscription plans
4. **Edit Plan**: Try modifying limits and features
5. **Create Plan**: Test creating a new subscription package

## Step 9: Environment Variables

Make sure your `.env.local` file has:

```env
# WordPress Integration
WORDPRESS_API_URL=http://localhost/statspro/graphql
WORDPRESS_REST_URL=http://localhost/statspro/wp-json
WORDPRESS_ADMIN_USER=stefano
WORDPRESS_ADMIN_PASS=sfg6678$$

# Stripe Integration  
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Next.js App
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXTAUTH_SECRET=your-super-secret-jwt-secret-here
NEXTAUTH_URL=http://localhost:3001
```

## Step 10: Troubleshooting

### Common Issues:

1. **Plugin Not Showing**:
   - Check if files are copied correctly
   - Verify ACF plugin is installed and active

2. **Custom Fields Not Showing**:
   - Make sure ACF is activated
   - Check if custom field groups are created

3. **API Not Working**:
   - Verify WordPress REST API is accessible
   - Check authentication tokens
   - Confirm user roles are set correctly

4. **Rate Limiting Not Working**:
   - Check if user has proper subscription assigned
   - Verify API endpoints are using `withRateLimit` middleware
   - Check database for API usage logs

### Test API Endpoints:

```bash
# Test subscription status
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/subscriptions/status?userId=1

# Test package management (admin only)
curl -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  http://localhost:3001/api/admin/packages

# Test rate limited endpoint
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/teams?sport=NFL
```

## Step 11: Production Considerations

When moving to production:

1. **Update Environment Variables** with production URLs
2. **Use Production Stripe Keys**
3. **Set Up SSL** for WordPress and Next.js
4. **Configure CORS** properly
5. **Set Up Database Backups**
6. **Monitor API Usage** and set up alerts

---

Your WordPress package feature control is now fully configured! Users will see accurate subscription statuses, API limits will be enforced based on their subscription tier, and admins can manage packages directly from WordPress.
