'use client'

import { useSearchParams } from 'next/navigation'

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'pro'

  const pricing = {
    starter: {
      price: '€29',
      title: 'SlimWoning Starter',
      description: 'Professionele aanwezigheid op SlimWoning.',
    },
    pro: {
      price: '€79',
      title: 'SlimWoning Pro',
      description: 'Meer zichtbaarheid en prioriteit bij verkopers.',
    },
    elite: {
      price: '€149',
      title: 'SlimWoning Elite',
      description: 'Maximale zichtbaarheid en dominantie in jouw regio.',
    },
  }

  const currentPlan =
    pricing[plan as keyof typeof pricing] || pricing.pro

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-8 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="mb-4 font-semibold uppercase tracking-[0.3em] text-[#2952ff]">
            SlimWoning Premium
          </p>

          <h1 className="mb-6 text-6xl font-black text-[#0a1f5c]">
            {plan.charAt(0).toUpperCase() + plan.slice(1)} abonnement activeren
          </h1>

          <p className="max-w-3xl text-2xl leading-relaxed text-slate-600">
            Bevestig je {plan} abonnement. Je wordt veilig doorgestuurd naar Stripe Checkout.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-[40px] border border-blue-200 bg-white p-10 shadow-xl lg:col-span-3">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-700">
                  {plan} abonnement
                </p>

                <h2 className="mt-4 text-6xl font-black text-[#0a1f5c]">
                  {currentPlan.price}
                  <span className="ml-2 text-xl font-bold text-slate-500">
                    /maand
                  </span>
                </h2>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                  {currentPlan.description}
                </p>
              </div>

              <a
                href={`/checkout?plan=${plan}`}
                className="inline-flex rounded-2xl bg-[#0a1f5c] px-10 py-5 text-lg font-black text-white transition hover:bg-[#102c7a]"
              >
                Bevestigen en betalen
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}