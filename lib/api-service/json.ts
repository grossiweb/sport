import { NextResponse } from 'next/server'

export type JsonValue =
  // We intentionally keep this loose because MongoDB documents can contain
  // ObjectId/Date values (both serialize fine via NextResponse.json), and
  // strict JSON typing becomes noisy across many API handlers.
  unknown

export function jsonOk<T = unknown>(
  data: T,
  init?: { status?: number; headers?: Record<string, string> }
) {
  return NextResponse.json(
    { success: true, data },
    { status: init?.status ?? 200, headers: init?.headers }
  )
}

export function jsonError(
  error: string,
  init?: {
    status?: number
    code?: string
    details?: JsonValue
    headers?: Record<string, string>
  }
) {
  return NextResponse.json(
    {
      success: false,
      error,
      code: init?.code,
      details: init?.details,
    },
    { status: init?.status ?? 400, headers: init?.headers }
  )
}


