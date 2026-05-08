'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [latestProperties, setLatestProperties] = useState<any[]>([])

  useEffect(() => {
    getLatestProperties()
  }, [])

  async function getLatestProperties() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('id', { ascending: false })
      .limit(3)

    if (error) {
      console.log(error)
      return
    }

    setLatestProperties(data || [])
  }

  function formatPrice(value: any) {
    const number = Number(String(value || '').replace(/[^\d.]/g, '')) || 0

    if (!number) return '-'

    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(number)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden px-5 py-20 md:px-10 md:py-28">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/10 blur-[140px]" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-5 text-sm uppercase tracking-[0.35em] text-gray-500">
              SlimWoning
            </p>

            <h1 className="text-5xl font-bold leading-tight md:text-7xl">
              Vergelijk woningen zonder gedoe.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
              Verzamel woningen, vergelijk kenmerken naast elkaar en download
              een duidelijk rapport. Alles op één plek, zonder losse notities.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/properties"
                className="rounded-2xl bg-white px-7 py-4 text-center font-bold text-black transition hover:bg-gray-200"
              >
                Start met vergelijken
              </Link>

              <Link
                href="/add-property"
                className="rounded-2xl border border-gray-700 px-7 py-4 text-center font-bold text-white transition hover:bg-[#111]"
              >
                Woning toevoegen
              </Link>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-4">
              <Stat number="PDF" label="Rapport" />
              <Stat number="4" label="Scores" />
              <Stat number="1" label="Overzicht" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-800 bg-[#0f0f0f] p-5 shadow-2xl">
            <div className="rounded-3xl bg-black p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Vergelijkingsrapport
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    2 woningen geselecteerd
                  </h2>
                </div>

                <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black">
                  PDF
                </span>
              </div>

              <div className="space-y-4">
                <ReportLine label="Prijs" value="€ 365.000 vs € 598.000" />
                <ReportLine label="Oppervlakte" value="92 m² vs 210 m²" />
                <ReportLine label="EPC" value="B vs A+" />
                <ReportLine label="Voorzieningen" value="Lift, terras, tuin" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <MiniScore label="Ruimte" score="82" />
                <MiniScore label="Comfort" score="76" />
                <MiniScore label="Energie" score="88" />
                <MiniScore label="Voorzieningen" score="71" />
              </div>

              <div className="mt-6 rounded-2xl bg-white p-4 text-black">
                <p className="font-bold">Rapport klaar om te downloaden</p>
                <p className="mt-1 text-sm text-gray-600">
                  Handig om later opnieuw te bekijken of te delen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {latestProperties.length > 0 && (
        <section className="px-5 py-14 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-end justify-between gap-5">
              <div>
                <p className="mb-3 text-sm uppercase tracking-[0.3em] text-gray-500">
                  Nieuw
                </p>

                <h2 className="text-4xl font-bold md:text-5xl">
                  Nieuwste woningen
                </h2>
              </div>

              <Link
                href="/properties"
                className="hidden text-gray-400 hover:text-white md:block"
              >
                Alle woningen →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {latestProperties.map((property) => (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="group overflow-hidden rounded-3xl bg-[#111] transition hover:scale-[1.01]"
                >
                  <img
                    src={property.image}
                    alt={property.title}
                    className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="p-5">
                    <h3 className="text-2xl font-bold">
                      {property.title}
                    </h3>

                    <p className="mt-2 text-xl font-bold">
                      {formatPrice(property.price)}
                    </p>

                    <p className="mt-1 text-gray-400">
                      {property.city}
                    </p>

                    <div className="mt-4 flex gap-3 text-sm text-gray-400">
                      <span>{property.slaapkamers || '-'} slp.</span>
                      <span>•</span>
                      <span>{property.bewoonbare_oppervlakte || '-'} m²</span>
                      <span>•</span>
                      <span>EPC {property.epc || '-'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              href="/properties"
              className="mt-6 block rounded-2xl border border-gray-800 p-4 text-center font-bold text-white md:hidden"
            >
              Alle woningen bekijken
            </Link>
          </div>
        </section>
      )}

      <section className="px-5 py-10 md:px-10">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-gray-800 bg-[#0f0f0f] p-5 md:p-7">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-black p-5">
              <p className="text-sm text-gray-500">Zoek snel</p>
              <p className="mt-2 text-xl font-bold">Woningen bekijken</p>
            </div>

            <div className="rounded-2xl bg-black p-5">
              <p className="text-sm text-gray-500">Bewaar</p>
              <p className="mt-2 text-xl font-bold">Favorieten</p>
            </div>

            <div className="rounded-2xl bg-black p-5">
              <p className="text-sm text-gray-500">Vergelijk</p>
              <p className="mt-2 text-xl font-bold">Kenmerken</p>
            </div>

            <Link
              href="/properties"
              className="flex items-center justify-center rounded-2xl bg-white p-5 text-center font-bold text-black transition hover:bg-gray-200"
            >
              Naar woningen →
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-gray-500">
              Werkwijze
            </p>

            <h2 className="text-4xl font-bold md:text-5xl">
              Van zoeken naar vergelijken in 3 stappen.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <StepCard
              number="01"
              title="Selecteer woningen"
              text="Kies interessante woningen en bepaal welke panden je naast elkaar wilt zetten."
            />

            <StepCard
              number="02"
              title="Vergelijk kenmerken"
              text="Bekijk prijs, oppervlakte, EPC, kamers, voorzieningen en plus- en minpunten in één overzicht."
            />

            <StepCard
              number="03"
              title="Download rapport"
              text="Maak een duidelijk vergelijkingsrapport dat je makkelijk kunt bewaren of delen."
            />
          </div>
        </div>
      </section>

      <section className="px-5 py-14 md:px-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-3">
          <FeatureBlock
            title="Minder twijfel"
            text="Door woningen gestructureerd naast elkaar te zetten zie je sneller waar de verschillen zitten."
          />

          <FeatureBlock
            title="Alles bij elkaar"
            text="Prijs, ruimte, EPC, voorzieningen, pluspunten en minpunten staan overzichtelijk op één plek."
          />

          <FeatureBlock
            title="Rapport als PDF"
            text="Download je vergelijking zodat je die later opnieuw kunt bekijken of met iemand kunt bespreken."
          />
        </div>
      </section>

      <section className="px-5 py-20 md:px-10">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-white p-8 text-center text-black md:p-14">
          <h2 className="text-4xl font-bold md:text-5xl">
            Klaar om woningen overzichtelijk te vergelijken?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-gray-600">
            Start met woningen bekijken, selecteer je favorieten en maak een
            duidelijk vergelijkingsrapport.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/properties"
              className="rounded-2xl bg-black px-7 py-4 font-bold text-white"
            >
              Start met vergelijken
            </Link>

            <Link
              href="/add-property"
              className="rounded-2xl border border-gray-300 px-7 py-4 font-bold text-black"
            >
              Woning toevoegen
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function Stat({
  number,
  label,
}: {
  number: string
  label: string
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-[#111] p-4">
      <p className="text-2xl font-bold">{number}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  )
}

function ReportLine({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
      <span className="text-gray-400">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  )
}

function MiniScore({
  label,
  score,
}: {
  label: string
  score: string
}) {
  return (
    <div className="rounded-2xl bg-[#111] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-sm font-bold">{score}/100</p>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#222]">
        <div
          className="h-full rounded-full bg-white"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

function StepCard({
  number,
  title,
  text,
}: {
  number: string
  title: string
  text: string
}) {
  return (
    <div className="rounded-3xl border border-gray-800 bg-[#111] p-7">
      <p className="text-sm font-bold text-gray-500">{number}</p>
      <h3 className="mt-5 text-2xl font-bold">{title}</h3>
      <p className="mt-3 leading-7 text-gray-400">{text}</p>
    </div>
  )
}

function FeatureBlock({
  title,
  text,
}: {
  title: string
  text: string
}) {
  return (
    <div className="rounded-3xl bg-[#111] p-8">
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="mt-4 leading-8 text-gray-400">{text}</p>
    </div>
  )
}