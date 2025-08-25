import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // For JWT tokens, logout is mainly handled on the client side
    // by removing the token from localStorage
    // 
    // In a more advanced setup, you might want to:
    // 1. Add the token to a blacklist
    // 2. Notify WordPress about the logout
    // 3. Invalidate refresh tokens
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
