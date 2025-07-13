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

export async function GET() {
  try {
    checkEnv();
    const { data, error } = await supabase
      .from('countdowns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No countdown found' }, { status: 404 })
    }

    return NextResponse.json(data[0])
  } catch (error: unknown) {
    console.error('Failed to fetch countdown:', error)
    const { message, stack } = getErrorMessageAndStack(error);
    return NextResponse.json({ error: message, stack }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    checkEnv();
    const body = await request.json()
    const { startValue, rate } = body

    // Stop any existing countdown
    await supabase
      .from('countdowns')
      .update({ is_running: false })
      .eq('is_running', true)

    // Create new countdown
    const { data, error } = await supabase
      .from('countdowns')
      .insert({
        start_value: startValue,
        rate_per_second: rate,
        is_running: true,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('Failed to create countdown:', error)
    const { message, stack } = getErrorMessageAndStack(error);
    return NextResponse.json({ error: message, stack }, { status: 500 })
  }
} 