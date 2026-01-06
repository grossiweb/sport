import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json'}/statspro/v1/check-roles`
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to check roles', status: response.status },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Check roles error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const response = await fetch(
      `${process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json'}/statspro/v1/create-roles`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_ADMIN_USER}:${process.env.WORDPRESS_ADMIN_PASS}`).toString('base64')}`
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: 'Failed to create roles', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Create roles error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

