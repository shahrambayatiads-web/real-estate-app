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
    <main className="min-h-screen bg-[#f6f8fb] text-[#111827]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#eef5ff] via-white to-[#f6f8fb] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-blue-700">
                SlimWoning
              </p>

              <h1 className="text-5xl font-bold leading-tight md:text-7xl">
                Zoek woningen. Vergelijk slimmer.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                Vind woningen, bewaar favorieten en maak een duidelijk
                vergelijkingsrapport met PDF-download.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-5 shadow-2xl md:p-7">
              <div className="mb-6 flex gap-6 border-b border-gray-200">
                <button className="border-b-2 border-blue-700 pb-3 font-bold text-blue-700">
                  Kopen
                </button>

                <button className="pb-3 text-gray-500">
                  Huren
                </button>

                <Link
                  href="/properties"
                  className="pb-3 font-bold text-gray-900"
                >
                  Vergelijken
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <input
                  placeholder="Gemeente, postcode of buurt"
                  className="rounded-2xl border border-gray-200 bg-[#f6f8fb] p-4 outline-none"
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <select className="rounded-2xl border border-gray-200 bg-[#f6f8fb] p-4 outline-none">
                    <option>Type woning</option>
                    <option>Huis</option>
                    <option>Appartement</option>
                    <option>Studio</option>
                    <option>Commercieel</option>
                  </select>

                  <select className="rounded-2xl border border-gray-200 bg-[#f6f8fb] p-4 outline-none">
                    <option>Maximum prijs</option>
                    <option>€ 250.000</option>
                    <option>€ 500.000</option>
                    <option>€ 750.000</option>
                    <option>€ 1.000.000</option>
                  </select>
                </div>

                <Link
                  href="/properties"
                  className="rounded-2xl bg-blue-700 p-4 text-center font-bold text-white transition hover:bg-blue-600"
                >
                  Zoek woningen
                </Link>
              </div>

              <div className="mt-5 rounded-2xl bg-[#eef5ff] p-4">
                <p className="font-bold text-blue-800">
                  Extra slim: vergelijk geselecteerde woningen
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Zet woningen naast elkaar en download een overzichtelijk
                  PDF-rapport.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 md:px-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-3">
          <ServiceCard
            title="Vergelijk woningen"
            text="Bekijk prijs, oppervlakte, EPC, kamers en voorzieningen naast elkaar."
          />

          <ServiceCard
            title="PDF rapport"
            text="Download je vergelijking als duidelijk rapport om later te bewaren of te delen."
          />

          <ServiceCard
            title="Favorieten"
            text="Bewaar interessante woningen en open ze later opnieuw."
          />
        </div>
      </section>

      {latestProperties.length > 0 && (
        <section className="px-5 py-10 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7 flex items-end justify-between gap-5">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-blue-700">
                  Nieuw
                </p>

                <h2 className="text-4xl font-bold">
                  Nieuwste woningen
                </h2>
              </div>

              <Link href="/properties" className="text-gray-500 hover:text-blue-700">
                Alle woningen →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {latestProperties.map((property) => (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="overflow-hidden rounded-[2rem] bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <img
                    src={property.image}
                    alt={property.title}
                    className="h-64 w-full object-cover"
                  />

                  <div className="p-6">
                    <h3 className="text-2xl font-bold">
                      {property.title}
                    </h3>

                    <p className="mt-2 text-2xl font-bold text-blue-700">
                      {formatPrice(property.price)}
                    </p>

                    <p className="mt-1 text-gray-500">
                      {property.city}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Badge text={`${property.slaapkamers || '-'} slp.`} />
                      <Badge text={`${property.bewoonbare_oppervlakte || '-'} m²`} />
                      <Badge text={`EPC ${property.epc || '-'}`} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-5 py-16 md:px-10">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-[#111827] p-8 text-white md:p-14">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-4xl font-bold md:text-5xl">
                Meer overzicht. Minder twijfel.
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-8 text-gray-300">
                Selecteer woningen, vergelijk kenmerken en download een rapport
                dat je makkelijk kunt bewaren of bespreken.
              </p>
            </div>

            <div className="flex md:justify-end">
              <Link
                href="/properties"
                className="rounded-2xl bg-white px-7 py-4 font-bold text-black"
              >
                Start vergelijking
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function ServiceCard({
  title,
  text,
}: {
  title: string
  text: string
}) {
  return (
    <div className="rounded-[2rem] bg-white p-8 shadow-lg">
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="mt-4 leading-8 text-gray-600">{text}</p>
    </div>
  )
}

function Badge({ text }: { text: string }) {
  return (
    <span className="rounded-full bg-[#eef2ff] px-4 py-2 text-sm font-semibold text-blue-700">
      {text}
    </span>
  )
}