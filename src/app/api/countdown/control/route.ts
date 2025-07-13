import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function checkEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase environment variables are not set. Check .env.local.');
  }
}

function getErrorMessageAndStack(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    const maybeError = error as { message?: unknown; stack?: unknown };
    return {
      message: typeof maybeError.message === 'string' ? maybeError.message : 'Unknown error',
      stack: typeof maybeError.stack === 'string' ? maybeError.stack : undefined,
    };
  }
  return { message: 'Unknown error', stack: undefined };
}

export async function PATCH(request: NextRequest) {
  try {
    checkEnv();
    const body = await request.json()
    const { action, startValue, rate } = body

    let updateData: Record<string, unknown> = {}

    switch (action) {
      case 'pause':
        updateData = { is_running: false }
        break
      case 'resume':
        updateData = { 
          is_running: true,
          started_at: new Date().toISOString()
        }
        break
      case 'reset':
        updateData = {
          is_running: false,
          start_value: startValue,
          rate_per_second: rate
        }
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('countdowns')
      .update(updateData)
      .eq('is_running', true)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('Failed to control countdown:', error)
    const { message, stack } = getErrorMessageAndStack(error);
    return NextResponse.json({ error: message, stack }, { status: 500 })
  }
} 