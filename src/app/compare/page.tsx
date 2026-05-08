'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ComparePage() {
  const searchParams = useSearchParams()
  const ids = useMemo(
    () => searchParams.get('ids')?.split(',').filter(Boolean) || [],
    [searchParams]
  )

  const [properties, setProperties] = useState<any[]>([])

  useEffect(() => {
    getProperties()
  }, [])

  async function getProperties() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('id', ids)

    if (error) {
      console.log(error)
      return
    }

    setProperties(data || [])
  }

  function numberValue(value: any) {
    return Number(String(value || '').replace(/[^\d.]/g, '')) || 0
  }

  function getScore(property: any) {
    return (
      numberValue(property.slaapkamers) * 2 +
      numberValue(property.badkamers) +
      numberValue(property.bewoonbare_oppervlakte) / 45 +
      (property.tuin ? 2 : 0) +
      (property.parking ? 1.5 : 0) +
      (property.terras ? 1 : 0) +
      (property.lift ? 0.5 : 0) +
      (property.dubbel_glas ? 1 : 0)
    )
  }

  const cheapest = properties.reduce((best, item) => {
    if (!best) return item
    return numberValue(item.price) < numberValue(best.price) ? item : best
  }, null)

  const largest = properties.reduce((best, item) => {
    if (!best) return item
    return numberValue(item.bewoonbare_oppervlakte) >
      numberValue(best.bewoonbare_oppervlakte)
      ? item
      : best
  }, null)

  const bestOverall = properties.reduce((best, item) => {
    if (!best) return item
    return getScore(item) > getScore(best) ? item : best
  }, null)

  if (properties.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Laden...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-5 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold md:text-5xl">
              Vergelijk woningen ⚖️
            </h1>

            <p className="mt-3 text-gray-400">
              Een heldere vergelijking met focus op prijs, ruimte, comfort en woonkwaliteit.
            </p>
          </div>

          <Link
            href="/properties"
            className="w-fit rounded-xl bg-white px-5 py-3 font-bold text-black"
          >
            Terug
          </Link>
        </div>

        <div className="mb-10 rounded-3xl border border-gray-800 bg-[#111] p-6 md:p-8">
          <h2 className="text-3xl font-bold">
            SlimWoning vastgoedanalyse
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-black p-5">
              <p className="text-gray-400">Financieel meest toegankelijk</p>
              <p className="mt-2 text-xl font-bold">
                {cheapest?.title}
              </p>
              <p className="mt-2 text-gray-300">
                Deze woning vraagt de laagste instapprijs en is daardoor interessanter voor kopers die hun budget strak willen bewaken.
              </p>
            </div>

            <div className="rounded-2xl bg-black p-5">
              <p className="text-gray-400">Sterkste woonvolume</p>
              <p className="mt-2 text-xl font-bold">
                {largest?.title}
              </p>
              <p className="mt-2 text-gray-300">
                Deze woning biedt de meeste bewoonbare oppervlakte en geeft daardoor meer vrijheid in dagelijks gebruik.
              </p>
            </div>

            <div className="rounded-2xl bg-black p-5">
              <p className="text-gray-400">Meest complete keuze</p>
              <p className="mt-2 text-xl font-bold">
                {bestOverall?.title}
              </p>
              <p className="mt-2 text-gray-300">
                Op basis van ruimte, kamers en voorzieningen komt deze woning als meest evenwichtige optie naar voren.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-black p-6 leading-8 text-gray-300">
            <h3 className="mb-5 text-2xl font-bold text-white">
              Professionele aankoopanalyse
            </h3>

            <p>
              Voor kopers die vooral belang hechten aan comfort, leefruimte en toekomstgericht wonen,
              komt <strong> {bestOverall?.title}</strong> het sterkst naar voren. De combinatie van
              woonoppervlakte, praktische voorzieningen en dagelijkse gebruikswaarde maakt deze woning
              bijzonder geschikt voor wie op lange termijn wil wonen.
            </p>

            <p className="mt-5">
              <strong>{cheapest?.title}</strong> is daarentegen de meer toegankelijke keuze op financieel vlak.
              Deze woning kan interessant zijn voor starters, alleenstaanden, koppels of investeerders die
              vooral letten op aankoopprijs en een lagere instapdrempel.
            </p>

            <p className="mt-5">
              Het verschil zit niet alleen in de prijs. Factoren zoals buitenruimte, aantal kamers,
              energieprestaties, parking en toekomstige onderhoudskosten bepalen mee of een woning op termijn
              echt de beste keuze blijft.
            </p>

            <p className="mt-5">
              Samengevat: <strong>{bestOverall?.title}</strong> lijkt de meest complete keuze voor wooncomfort
              en dagelijks gebruik. <strong>{cheapest?.title}</strong> blijft aantrekkelijk wanneer budget en
              financiële flexibiliteit zwaarder doorwegen dan extra ruimte of comfort.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div
            className="grid min-w-[900px] gap-5"
            style={{
              gridTemplateColumns: `repeat(${properties.length}, minmax(280px, 1fr))`,
            }}
          >
            {properties.map((property) => (
              <div
                key={property.id}
                className="rounded-3xl bg-[#111] p-5"
              >
                <img
                  src={property.image}
                  alt={property.title}
                  className="h-56 w-full rounded-2xl object-cover"
                />

                <h2 className="mt-5 text-3xl font-bold">
                  {property.title}
                </h2>

                <p className="mt-2 text-2xl font-semibold">
                  € {property.price}
                </p>

                <p className="text-gray-400">
                  {property.city}
                </p>

                <div className="mt-6 space-y-4">
                  {[
                    ['Slaapkamers', property.slaapkamers || '-'],
                    ['Badkamers', property.badkamers || '-'],
                    ['Oppervlakte', `${property.bewoonbare_oppervlakte || '-'} m²`],
                    ['Grondoppervlakte', `${property.grondoppervlakte || '-'} m²`],
                    ['Bouwjaar', property.bouwjaar || '-'],
                    ['EPC', property.epc || '-'],
                    ['Type woning', property.woning_type || '-'],
                    ['Verwarming', property.verwarmingstype || '-'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-black p-4">
                      <p className="text-sm text-gray-400">{label}</p>
                      <p className="mt-1 text-lg font-bold">{value}</p>
                    </div>
                  ))}

                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-sm text-gray-400">Pluspunten</p>
                    <p className="mt-1 text-sm text-gray-300">
                      {property.pluspunten || '-'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-sm text-gray-400">Minpunten</p>
                    <p className="mt-1 text-sm text-gray-300">
                      {property.minpunten || '-'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-sm text-gray-400">Voorzieningen</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {property.parking && <Badge text="Parking" />}
                      {property.tuin && <Badge text="Tuin" />}
                      {property.terras && <Badge text="Terras" />}
                      {property.lift && <Badge text="Lift" />}
                      {property.gemeubeld && <Badge text="Gemeubeld" />}
                      {property.dubbel_glas && <Badge text="Dubbel glas" />}
                    </div>
                  </div>

                  <Link
                    href={`/properties/${property.id}`}
                    className="block rounded-2xl bg-white p-4 text-center font-bold text-black"
                  >
                    Bekijk woning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Badge({ text }: { text: string }) {
  return (
    <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-black">
      {text}
    </span>
  )
}