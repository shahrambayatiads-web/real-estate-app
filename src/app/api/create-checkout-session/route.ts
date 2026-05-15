import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY ontbreekt in .env.local')
}

const stripe = new Stripe(stripeSecretKey)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const leadId = body?.leadId ? String(body.leadId) : ''
    const plan = body?.plan ? String(body.plan) : 'pro'

    console.log('Checkout request body:', {
      leadId,
      plan,
    })

    const isSubscriptionOnly = !leadId || leadId === 'subscription'

    let lead: any = null

    if (!isSubscriptionOnly) {
      const { data: leadData, error: leadError } = await supabase
        .from('makelaar_leads')
        .select('status')
        .eq('id', leadId)
        .single()

      if (leadError || !leadData) {
        return NextResponse.json(
          { error: 'Lead niet gevonden' },
          { status: 404 }
        )
      }

      if (leadData.status !== 'new') {
        return NextResponse.json(
          { error: 'Deze premium lead is al geclaimd' },
          { status: 409 }
        )
      }

      lead = leadData
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const successUrl = !isSubscriptionOnly && leadId
      ? `${origin}/makelaar-dashboard?payment=success&lead_id=${encodeURIComponent(leadId)}&plan=${encodeURIComponent(plan)}`
      : `${origin}/makelaar-dashboard?payment=success&plan=${encodeURIComponent(plan)}`

    const planConfig = {
      starter: {
        amount: 2900,
        credits: 0,
        homepageDays: 0,
        name: 'SlimWoning Starter',
      },
      pro: {
        amount: 7900,
        credits: 1,
        homepageDays: 7,
        name: 'SlimWoning Pro',
      },
      elite: {
        amount: 14900,
        credits: 3,
        homepageDays: 21,
        name: 'SlimWoning Elite',
      },
    } as const

    const selectedPlan =
      planConfig[plan as keyof typeof planConfig] || planConfig.pro

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'bancontact'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: selectedPlan.amount,
            product_data: {
              name: selectedPlan.name,
              description: 'SlimWoning makelaar abonnement',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        lead_id: leadId,
        plan,
        premium_credits: String(selectedPlan.credits),
        homepage_days: String(selectedPlan.homepageDays),
      },
      success_url: successUrl,
      cancel_url: !isSubscriptionOnly && leadId
        ? `${origin}/checkout?payment=cancelled&lead_id=${encodeURIComponent(leadId)}`
        : `${origin}/checkout?payment=cancelled`,
    })

    console.log('Stripe session created:', {
      url: session.url,
      successUrl,
    })

    return NextResponse.json({
      url: session.url,
      successUrl,
      leadId,
      plan,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)

    return NextResponse.json(
      { error: 'Stripe error' },
      { status: 500 }
    )
  }
}