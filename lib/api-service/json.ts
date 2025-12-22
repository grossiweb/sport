import { NextResponse } from 'next/server'

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[]

export function jsonOk<T extends JsonValue>(
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


