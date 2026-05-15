import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getPlanConfig(plan: string) {
  const plans = {
    starter: {
      credits: 0,
      homepageDays: 0,
    },
    pro: {
      credits: 1,
      homepageDays: 7,
    },
    elite: {
      credits: 3,
      homepageDays: 21,
    },
  }

  return plans[plan as keyof typeof plans] || plans.pro
}

export async function GET() {
  const now = new Date().toISOString()

  const { data: subscriptions, error } = await supabase
    .from('makelaar_subscriptions')
    .select('*')
    .lte('current_period_end', now)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  for (const subscription of subscriptions || []) {
    const nextPlan = subscription.pending_plan || subscription.plan
    const config = getPlanConfig(nextPlan)

    await supabase
      .from('makelaar_subscriptions')
      .update({
        plan: nextPlan,
        premium_credits: config.credits,
        homepage_days: config.homepageDays,
        current_period_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        pending_plan: null,
        cancel_at_period_end: false,
      })
      .eq('id', subscription.id)
  }

  return NextResponse.json({
    success: true,
    updated: subscriptions?.length || 0,
  })
}
