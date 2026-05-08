'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ComparePage() {
  const searchParams = useSearchParams()

  const ids = searchParams.get('ids')?.split(',') || []

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
    } else {
      setProperties(data)
    }
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
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              Vergelijk woningen ⚖️
            </h1>

            <p className="mt-2 text-gray-400">
              Vergelijk woningen naast elkaar.
            </p>
          </div>

          <Link
            href="/properties"
            className="rounded-xl bg-white px-5 py-3 font-bold text-black"
          >
            Terug
          </Link>
        </div>

        <div className="overflow-x-auto">
          <div className="grid min-w-[900px] grid-cols-3 gap-5">
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
                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-sm text-gray-400">
                      Slaapkamers
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {property.slaapkamers || '-'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-sm text-gray-400">
                      Badkamers
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {property.badkamers || '-'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-sm text-gray-400">
                      Oppervlakte
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {property.bewoonbare_oppervlakte || '-'} m²
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-sm text-gray-400">
                      EPC
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {property.epc || '-'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-sm text-gray-400">
                      Verwarming
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {property.verwarmingstype || '-'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-sm text-gray-400">
                      Pluspunten
                    </p>

                    <p className="mt-1 text-sm text-gray-300">
                      {property.pluspunten || '-'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-sm text-gray-400">
                      Minpunten
                    </p>

                    <p className="mt-1 text-sm text-gray-300">
                      {property.minpunten || '-'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-sm text-gray-400">
                      Voorzieningen
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {property.parking && (
                        <span className="rounded-full bg-white px-3 py-1 text-sm text-black">
                          Parking
                        </span>
                      )}

                      {property.tuin && (
                        <span className="rounded-full bg-white px-3 py-1 text-sm text-black">
                          Tuin
                        </span>
                      )}

                      {property.terras && (
                        <span className="rounded-full bg-white px-3 py-1 text-sm text-black">
                          Terras
                        </span>
                      )}

                      {property.lift && (
                        <span className="rounded-full bg-white px-3 py-1 text-sm text-black">
                          Lift
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}