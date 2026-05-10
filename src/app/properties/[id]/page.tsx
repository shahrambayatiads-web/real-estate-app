'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'

export default function PropertyDetailsPage() {
  const params = useParams()
  const router = useRouter()

  const [property, setProperty] = useState<any>(null)
  const [userId, setUserId] = useState('')
  const [showMap, setShowMap] = useState(false)

  const [mapCenter, setMapCenter] = useState({
    lat: 51.2194,
    lng: 4.4025,
  })

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  useEffect(() => {
    getProperty()
    getUser()
  }, [])

  useEffect(() => {
    if (!showMap || !isLoaded || !property?.address || !window.google) return

    const geocoder = new window.google.maps.Geocoder()

    geocoder.geocode(
      {
        address: `${property.address}, ${property.city || ''}, Belgium`,
      },
      (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const location = results[0].geometry.location

          setMapCenter({
            lat: location.lat(),
            lng: location.lng(),
          })
        } else {
          console.log('Geocode fout:', status)
        }
      }
    )
  }, [showMap, isLoaded, property])

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) setUserId(user.id)
  }

  async function getProperty() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.log(error)
    } else {
      setProperty(data)
    }
  }

  async function handleDelete() {
    const confirmDelete = confirm(
      'Weet je zeker dat je deze woning wilt verwijderen?'
    )

    if (!confirmDelete) return

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', params.id)

    if (error) {
      alert('Fout bij verwijderen van woning')
      console.log(error)
    } else {
      router.push('/properties')
    }
  }

  function yesNo(value: boolean | null) {
    if (value === true) return 'Ja'
    if (value === false) return 'Nee'
    return 'Niet opgegeven'
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

  function cleanWoningType(value: any) {
    const text = String(value || '').trim()

    if (!text) return 'Niet opgegeven'
    if (!Number.isNaN(Number(text))) return 'Appartement'

    return text
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] text-2xl font-bold text-[#111827]">
        Laden...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-5 py-8 text-[#111827] md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/properties"
            className="rounded-2xl bg-white px-5 py-3 font-bold text-[#111827] shadow-sm"
          >
            ← Terug naar woningen
          </Link>

          <Link
            href="/properties"
            className="hidden rounded-2xl bg-blue-700 px-5 py-3 font-bold text-white md:block"
          >
            Vergelijk woningen
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.45fr_0.75fr]">
          <div>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">
              <img
                src={property.image}
                alt={property.title}
                className="h-[420px] w-full object-cover md:h-[620px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

              <div className="absolute left-6 top-6 flex gap-3">
                <div className="rounded-full bg-white/95 px-5 py-3 text-sm font-bold text-[#111827] shadow-xl backdrop-blur">
                  EPC {property.epc || '-'}
                </div>

                <div className="rounded-full bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-xl">
                  Nieuw
                </div>
              </div>

              <div className="absolute right-6 top-6 flex gap-3">
                <button className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-2xl text-white backdrop-blur transition hover:scale-105">
                  ❤️
                </button>

                <button className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-2xl text-white backdrop-blur transition hover:scale-105">
                  ↗
                </button>
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] bg-white p-8 shadow-xl">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-blue-700">
                    {property.city || 'Locatie niet opgegeven'}
                  </p>

                  <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
                    {property.title}
                  </h1>

                  {property.address && (
                    <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-[#f8fafc] p-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-700">
                          Adres
                        </p>

                        <p className="mt-2 text-lg font-bold text-[#111827]">
                          {property.address}, {property.city}
                        </p>
                      </div>

                      <button
                        onClick={() => setShowMap(true)}
                        className="rounded-2xl bg-blue-700 px-6 py-4 font-bold text-white transition hover:bg-blue-800"
                      >
                        Open kaart
                      </button>
                    </div>
                  )}
                </div>

                <div className="rounded-[1.5rem] bg-[#eef2ff] px-7 py-6">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
                    Vraagprijs
                  </p>

                  <p className="mt-2 text-4xl font-bold text-blue-700">
                    {formatPrice(property.price)}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                <QuickStat label="Slaapkamers" value={property.slaapkamers || '-'} />
                <QuickStat label="Badkamers" value={property.badkamers || '-'} />
                <QuickStat
                  label="Oppervlakte"
                  value={
                    property.bewoonbare_oppervlakte
                      ? `${property.bewoonbare_oppervlakte} m²`
                      : '-'
                  }
                />
                <QuickStat label="EPC" value={property.epc || '-'} />
              </div>
            </div>

            <SectionCard title="Beschrijving">
              <p className="leading-8 text-gray-600">
                {property.description || 'Geen beschrijving beschikbaar.'}
              </p>
            </SectionCard>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <SectionCard title="Pluspunten">
                <p className="leading-8 text-gray-600">
                  {property.pluspunten || 'Niet opgegeven'}
                </p>
              </SectionCard>

              <SectionCard title="Minpunten">
                <p className="leading-8 text-gray-600">
                  {property.minpunten || 'Niet opgegeven'}
                </p>
              </SectionCard>
            </div>
          </div>

          <div className="h-fit rounded-[2rem] bg-white p-7 shadow-xl lg:sticky lg:top-8">
            <h2 className="mb-6 text-3xl font-bold">Woningdetails</h2>

            <div className="space-y-1">
              <InfoRow label="Adres" value={property.address} />
              <InfoRow label="Type woning" value={cleanWoningType(property.woning_type)} />
              <InfoRow label="Slaapkamers" value={property.slaapkamers} />
              <InfoRow label="Badkamers" value={property.badkamers} />
              <InfoRow
                label="Bewoonbare oppervlakte"
                value={
                  property.bewoonbare_oppervlakte
                    ? `${property.bewoonbare_oppervlakte} m²`
                    : ''
                }
              />
              <InfoRow
                label="Grondoppervlakte"
                value={
                  property.grondoppervlakte
                    ? `${property.grondoppervlakte} m²`
                    : ''
                }
              />
              <InfoRow label="Bouwjaar" value={property.bouwjaar} />
              <InfoRow label="EPC" value={property.epc} />
              <InfoRow label="Verwarming" value={property.verwarmingstype} />
              <InfoRow label="Parking" value={yesNo(property.parking)} />
              <InfoRow label="Tuin" value={yesNo(property.tuin)} />
              <InfoRow label="Terras" value={yesNo(property.terras)} />
              <InfoRow label="Lift" value={yesNo(property.lift)} />
              <InfoRow label="Gemeubeld" value={yesNo(property.gemeubeld)} />
              <InfoRow label="Dubbel glas" value={yesNo(property.dubbel_glas)} />
            </div>

            <Link
              href="/properties"
              className="mt-8 block w-full rounded-2xl bg-blue-700 p-5 text-center font-bold text-white transition hover:bg-blue-800"
            >
              Vergelijk met andere woningen
            </Link>

            {userId === property.user_id && (
              <div className="mt-4 grid grid-cols-1 gap-3">
                <Link href={`/edit-property/${property.id}`}>
                  <button className="w-full rounded-2xl bg-[#111827] p-5 font-bold text-white">
                    Bewerken
                  </button>
                </Link>

                <button
                  onClick={handleDelete}
                  className="w-full rounded-2xl bg-red-600 p-5 font-bold text-white"
                >
                  Verwijderen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5">
          <div className="relative w-full max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <button
              onClick={() => setShowMap(false)}
              className="absolute right-5 top-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-2xl font-bold text-white"
            >
              ✕
            </button>

            <div className="h-[85vh] w-full">
              {!isLoaded && (
                <div className="flex h-full items-center justify-center text-2xl font-bold">
                  Map laden...
                </div>
              )}

              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={{
                    width: '100%',
                    height: '100%',
                  }}
                  center={mapCenter}
                  zoom={15}
                >
                  <Marker position={mapCenter} />
                </GoogleMap>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/70 to-transparent p-8">
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {property.title}
                </h2>

                <p className="mt-2 text-lg text-gray-300">
                  {property.address || property.city}
                </p>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${property.address || ''} ${property.city || ''}`
                )}`}
                target="_blank"
                className="rounded-2xl bg-blue-700 px-7 py-5 font-bold text-white transition hover:bg-blue-800"
              >
                Open Google Maps
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function QuickStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.5rem] bg-[#f8fafc] p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mt-6 rounded-[2rem] bg-white p-8 shadow-xl">
      <h2 className="mb-5 text-3xl font-bold">{title}</h2>
      {children}
    </div>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: any
}) {
  return (
    <div className="flex justify-between gap-5 border-b border-gray-100 py-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-bold">
        {value || 'Niet opgegeven'}
      </span>
    </div>
  )
}