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
    if (ids.length === 0) {
      setProperties([])
      return
    }

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

  const lowestPrice = properties.reduce((best, item) => {
    if (!best) return item
    return numberValue(item.price) < numberValue(best.price) ? item : best
  }, null)

  const largestSurface = properties.reduce((best, item) => {
    if (!best) return item
    return numberValue(item.bewoonbare_oppervlakte) >
      numberValue(best.bewoonbare_oppervlakte)
      ? item
      : best
  }, null)

  const mostComplete = properties.reduce((best, item) => {
    if (!best) return item
    return getScore(item) > getScore(best) ? item : best
  }, null)

  if (ids.length === 0) {
    return (
      <div className="min-h-screen bg-black px-5 py-10 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl bg-[#111] p-8 text-center">
          <h1 className="text-3xl font-bold">Geen woningen geselecteerd</h1>
          <p className="mt-3 text-gray-400">
            Selecteer eerst minimaal twee woningen om ze te vergelijken.
          </p>
          <Link
            href="/properties"
            className="mt-6 inline-block rounded-xl bg-white px-5 py-3 font-bold text-black"
          >
            Naar woningen
          </Link>
        </div>
      </div>
    )
  }

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
              Een overzicht van prijs, ruimte, kenmerken en voorzieningen.
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
            Woningvergelijking
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-black p-5">
              <p className="text-gray-400">Laagste prijs</p>
              <p className="mt-2 text-xl font-bold">
                {lowestPrice?.title}
              </p>
              <p className="mt-2 text-gray-300">
                Deze woning heeft binnen deze selectie de laagste aankoopprijs.
              </p>
            </div>

            <div className="rounded-2xl bg-black p-5">
              <p className="text-gray-400">Grootste oppervlakte</p>
              <p className="mt-2 text-xl font-bold">
                {largestSurface?.title}
              </p>
              <p className="mt-2 text-gray-300">
                Deze woning heeft de grootste opgegeven bewoonbare oppervlakte.
              </p>
            </div>

            <div className="rounded-2xl bg-black p-5">
              <p className="text-gray-400">Meeste kenmerken</p>
              <p className="mt-2 text-xl font-bold">
                {mostComplete?.title}
              </p>
              <p className="mt-2 text-gray-300">
                Deze woning combineert meerdere kenmerken zoals ruimte, kamers en voorzieningen.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-black p-6 leading-8 text-gray-300">
            <h3 className="mb-5 text-2xl font-bold text-white">
              Samenvatting
            </h3>

            <p>
              Deze vergelijking toont de belangrijkste verschillen tussen de geselecteerde woningen.
              Daarbij wordt gekeken naar prijs, oppervlakte, aantal kamers, EPC, voorzieningen en opgegeven plus- en minpunten.
            </p>

            <p className="mt-5">
              <strong>{largestSurface?.title}</strong> heeft binnen deze selectie de meeste opgegeven woonruimte.
              Dat kan handig zijn voor wie extra leefruimte, meerdere kamers of meer flexibiliteit zoekt.
            </p>

            <p className="mt-5">
              <strong>{lowestPrice?.title}</strong> heeft de laagste aankoopprijs binnen deze vergelijking.
              Dit kan interessant zijn voor kopers die vooral op budget letten of een lagere instapprijs zoeken.
            </p>

            <p className="mt-5">
              Vergelijk naast de prijs ook zaken zoals EPC, bouwjaar, oppervlakte, buitenruimte, parking en minpunten.
              Zo krijg je een vollediger beeld van welke woning het best aansluit bij jouw situatie.
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