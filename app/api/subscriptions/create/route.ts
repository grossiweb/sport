import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, userEmail, userName } = await request.json()

    // Validate required fields
    if (!priceId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId, userId, userEmail' },
        { status: 400 }
      )
    }

    // Create or retrieve Stripe customer
    let customer
    try {
      // Check if customer already exists
      const existingCustomers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: userEmail,
          name: userName,
          metadata: {
            userId: userId.toString(),
          },
        })
      }
    } catch (error) {
      console.error('Error creating/retrieving customer:', error)
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      )
    }

    // Create checkout session
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe?cancelled=true`,
        metadata: {
          userId: userId.toString(),
        },
        subscription_data: {
          metadata: {
            userId: userId.toString(),
          },
        },
      })

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
      })
    } catch (error) {
      console.error('Error creating checkout session:', error)
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Subscription creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
