'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

type LocationSuggestion = {
  id: string
  label: string
}

const propertyTypesWithoutBedrooms = ['Grond', 'Handelszaak', 'Kot', 'Garage']

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Property = {
  id: string
  title?: string
  city?: string
  price?: number
  image_url?: string
  image?: string
  photo_url?: string
  main_image?: string
  images?: string[]
  created_at?: string
}

const belgiumPostcodes: LocationSuggestion[] = [
  { id: '1930-zaventem', label: '1930 Zaventem' },
  { id: '1930-nossegem', label: '1930 Nossegem' },
  { id: '1933-sterrebeek', label: '1933 Sterrebeek' },
  { id: '1000-brussel', label: '1000 Brussel' },
  { id: '2000-antwerpen', label: '2000 Antwerpen' },
  { id: '9000-gent', label: '9000 Gent' },
]

export default function HomePage() {
  const [locationQuery, setLocationQuery] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [locationLoading, setLocationLoading] = useState(false)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [bedrooms, setBedrooms] = useState(0)
  const [propertyType, setPropertyType] = useState('')
  const [minPrice, setMinPrice] = useState('0')
  const [maxPrice, setMaxPrice] = useState('0')
  const bedroomsDisabled = propertyTypesWithoutBedrooms.includes(propertyType)
  const [latestProperties, setLatestProperties] = useState<Property[]>([])
  const [questionSent, setQuestionSent] = useState(false)

  useEffect(() => {
    async function loadLatestProperties() {
      try {
        const { data } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6)

        if (data) {
          setLatestProperties(data)
        }
      } catch (error) {
        console.log(error)
      }
    }

    loadLatestProperties()
  }, [])

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      alert('Locatie wordt niet ondersteund door deze browser.')
      return
    }

    setLocationLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          )

          const data = await response.json()
          const postcode = data.address?.postcode
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.municipality ||
            data.address?.county

          const label = [postcode, city].filter(Boolean).join(' ')

          if (label) {
            setLocationQuery(label)
            setShowLocationSuggestions(false)
          } else {
            alert('Locatie gevonden, maar gemeente kon niet worden bepaald.')
          }
        } catch (error) {
          console.log(error)
          alert('Locatie kon niet worden opgehaald.')
        } finally {
          setLocationLoading(false)
        }
      },
      () => {
        setLocationLoading(false)
        alert('Locatietoegang geweigerd.')
      }
    )
  }

  useEffect(() => {
    const query = locationQuery.trim()

    if (query.length < 2) {
      setLocationSuggestions([])
      setShowLocationSuggestions(false)
      return
    }

    const localSuggestions = belgiumPostcodes.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase())
    )

    if (localSuggestions.length > 0) {
      setLocationSuggestions(localSuggestions)
      setShowLocationSuggestions(true)
      return
    }

    const timeout = setTimeout(async () => {
      try {
        setLocationLoading(true)

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=be&addressdetails=1&limit=6&q=${encodeURIComponent(query)}`
        )

        const data = await response.json()

        const suggestions = data
          .map((item: any) => {
            const postcode = item.address?.postcode
            const city =
              item.address?.city ||
              item.address?.town ||
              item.address?.village ||
              item.address?.municipality ||
              item.address?.county

            if (!city && !postcode) return null

            return {
              id: String(item.place_id),
              label: [postcode, city].filter(Boolean).join(' '),
            }
          })
          .filter(Boolean)
          .filter(
            (item: LocationSuggestion, index: number, list: LocationSuggestion[]) =>
              list.findIndex((other) => other.label === item.label) === index
          )

        setLocationSuggestions(suggestions)
        setShowLocationSuggestions(suggestions.length > 0)
      } catch (error) {
        console.log(error)
        setLocationSuggestions([])
        setShowLocationSuggestions(false)
      } finally {
        setLocationLoading(false)
      }
    }, 350)

    return () => clearTimeout(timeout)
  }, [locationQuery])

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f7fb] text-[#111827]">
      <style>{`
        @keyframes pulsePlay {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        @keyframes progressMove {
          0% { width: 20%; }
          50% { width: 70%; }
          100% { width: 92%; }
        }

        @keyframes glowCard {
          0%,100% { box-shadow: 0 0 0 rgba(37,99,235,0.15); }
          50% { box-shadow: 0 18px 40px rgba(37,99,235,0.28); }
        }

        .demo-play {
          animation: pulsePlay 2s ease-in-out infinite;
        }

        .demo-progress {
          animation: progressMove 5s ease-in-out infinite;
        }

        .demo-glow {
          animation: glowCard 3s ease-in-out infinite;
        }
      `}</style>
      <section className="relative px-5 py-6 md:px-10 md:py-8">
        <div className="absolute left-[-12rem] top-[-8rem] h-[30rem] w-[30rem] rounded-full bg-blue-500/12 blur-3xl" />
        <div className="absolute right-[-10rem] top-16 h-[28rem] w-[28rem] rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-1/4 h-[24rem] w-[24rem] rounded-full bg-slate-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid min-h-[500px] grid-cols-1 items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] xl:gap-24">
            <div className="relative pt-2">

              <div className="w-full max-w-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h1 className="mt-2 max-w-xl text-4xl font-black tracking-[-0.04em] text-[#0B1F4D] md:text-5xl">
                      Vergelijk woningen zonder gedoe.
                    </h1>
                  </div>

                  <div className="rounded-full border border-blue-100 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-blue-700 shadow-sm">
                    0:30
                  </div>
                </div>

                <div className="rounded-[1.25rem] bg-transparent p-0">
                  <div className="mb-4 flex items-center gap-3 text-xs font-black uppercase tracking-[0.14em] text-gray-400">
                    <span className="text-blue-700">1 Selecteer</span>
                    <span>→</span>
                    <span className="text-blue-700">2 Vergelijk</span>
                    <span>→</span>
                    <span className="text-blue-700">3 PDF</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                      <div className="h-28 overflow-hidden bg-blue-50">
                        <img
                          src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80"
                          alt="Woning A"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="p-3">
                        <p className="text-xs font-bold text-gray-500">Woning A</p>
                        <p className="mt-1 text-lg font-black text-[#0B1F4D]">€ 450.000</p>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-bold text-gray-500">
                          <span>EPC B</span>
                          <span>120 m²</span>
                        </div>

                        <div className="mt-3 h-2 rounded-full bg-gray-200">
                          <div className="h-2 w-[72%] rounded-full bg-blue-500" />
                        </div>
                      </div>
                    </div>

                    <div className="demo-glow relative overflow-hidden rounded-2xl bg-white shadow-md ring-2 ring-blue-600">
                      <div className="absolute right-3 top-3 z-10 rounded-full bg-blue-700 px-2 py-1 text-[10px] font-black text-white">
                        Beste
                      </div>

                      <div className="h-28 overflow-hidden bg-blue-50">
                        <img
                          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80"
                          alt="Woning B"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="p-3">
                        <p className="text-xs font-bold text-gray-500">Woning B</p>
                        <p className="mt-1 text-lg font-black text-[#0B1F4D]">€ 420.000</p>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-bold text-gray-500">
                          <span>EPC A</span>
                          <span>135 m²</span>
                        </div>

                        <div className="mt-3 h-2 rounded-full bg-gray-200">
                          <div className="demo-progress h-2 rounded-full bg-blue-700" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-blue-100 bg-white/55 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                      AI conclusie
                    </p>
                    <p className="mt-2 text-sm font-bold leading-6 text-[#0B1F4D]">
                      Woning B scoort beter op prijs, EPC en locatie. PDF rapport klaar.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/45 px-4 py-3 ring-1 ring-white/70">
                  <button className="demo-play flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-sm text-white shadow-lg shadow-blue-700/20">
                    ▶
                  </button>

                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div className="demo-progress h-full rounded-full bg-blue-700" />
                    </div>
                  </div>

                  <p className="text-sm font-bold text-gray-500">
                    0:18
                  </p>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-blue-600/8 via-sky-400/8 to-slate-200/20 blur-2xl" />

              <div className="relative mt-2 ml-auto w-full max-w-xl rounded-[1.25rem] bg-white/55 p-5 backdrop-blur-sm md:p-6">
                <div className="mb-5 flex items-center gap-3 border-b border-gray-200">
                  <button className="relative pb-3 text-base font-extrabold text-blue-700">
                    Te koop
                    <span className="absolute bottom-[-1px] left-0 h-1 w-full rounded-full bg-blue-700" />
                  </button>
                  <button className="pb-3 text-base font-bold text-gray-500">
                    Te huur
                  </button>
                </div>

                <div className="mb-5">
                  <label className="mb-2 block text-base font-bold text-gray-700">
                    Voeg een locatie toe
                  </label>

                  <div className="relative">
                    <input
                      value={locationQuery}
                      onChange={(event) => setLocationQuery(event.target.value)}
                      onFocus={() => {
                        if (locationSuggestions.length > 0) {
                          setShowLocationSuggestions(true)
                        }
                      }}
                      placeholder="Gemeente of postcode"
                      className="w-full rounded-2xl border border-gray-200 bg-[#f8fafc] px-4 py-3 pr-12 text-base font-medium outline-none transition focus:border-blue-600 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={useCurrentLocation}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl text-blue-700 transition hover:scale-110"
                      aria-label="Gebruik mijn locatie"
                    >
                      ⌖
                    </button>

                    {showLocationSuggestions && (
                      <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                        {locationSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            type="button"
                            onClick={() => {
                              setLocationQuery(suggestion.label)
                              setShowLocationSuggestions(false)
                            }}
                            className="block w-full px-5 py-3 text-left text-base font-bold text-[#0B1F4D] transition hover:bg-[#eef5ff]"
                          >
                            {suggestion.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {locationLoading && (
                      <p className="mt-2 text-sm font-semibold text-blue-700">
                        Gemeenten zoeken...
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-base font-bold text-gray-700">
                      Type vastgoed
                    </label>
                    <div className="relative">
                      <select
                        value={propertyType}
                        onChange={(event) => {
                          const value = event.target.value
                          setPropertyType(value)

                          if (propertyTypesWithoutBedrooms.includes(value)) {
                            setBedrooms(0)
                          }
                        }}
                        className="h-12 w-full appearance-none rounded-xl border border-blue-600 bg-white px-4 pr-12 text-base font-semibold leading-none text-blue-700 outline-none"
                      >
                        <option>Selecteer...</option>
                        <option>Huis</option>
                        <option>Appartement</option>
                        <option>Huis en appartement</option>
                        <option>Nieuwbouwproject - Huizen</option>
                        <option>Nieuwbouwproject - Appartementen</option>
                        <option>Nieuwbouwproject</option>
                        <option>Kot</option>
                        <option>Garage</option>
                        <option>Kantoor</option>
                        <option>Handelszaak</option>
                        <option>Industrie</option>
                        <option>Grond</option>
                        <option>Opbrengsteigendom</option>
                        <option>Andere</option>
                      </select>

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-blue-700">
                        ▼
                      </span>
                    </div>
                  </div>

                  <div className={bedroomsDisabled ? 'opacity-40' : ''}>
                    <label className="mb-2 block text-base font-bold text-gray-700">
                      Minimum aantal slaapkamers
                    </label>

                    <div className="flex items-center overflow-hidden rounded-xl border border-blue-600 bg-white">
                      <button
                        type="button"
                        disabled={bedroomsDisabled}
                        onClick={() => setBedrooms((value) => Math.max(0, value - 1))}
                        className="flex h-12 w-12 items-center justify-center bg-gray-100 text-xl font-black text-gray-500 transition hover:bg-gray-200"
                      >
                        -
                      </button>

                      <div className="flex-1 text-center text-xl font-black text-blue-700">
                        {bedrooms}
                      </div>

                      <button
                        type="button"
                        disabled={bedroomsDisabled}
                        onClick={() => setBedrooms((value) => value + 1)}
                        className="flex h-12 w-12 items-center justify-center border-l border-blue-600 bg-white text-xl font-black text-blue-700 transition hover:bg-blue-50"
                      >
                        +
                      </button>
                    </div>

                    {bedroomsDisabled && (
                      <p className="mt-2 text-sm font-semibold text-gray-500">
                        Slaapkamers niet van toepassing voor dit type vastgoed.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-bold text-gray-700">
                      Minimum
                    </label>

                    <input
                      type="number"
                      value={minPrice}
                      onChange={(event) => setMinPrice(event.target.value)}
                      className="w-full rounded-xl border border-blue-600 bg-white px-4 py-3 text-base font-semibold text-blue-700 outline-none"
                      placeholder="€ 0"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-bold text-gray-700">
                      Maximum
                    </label>

                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(event.target.value)}
                      className="w-full rounded-xl border border-blue-600 bg-white px-4 py-3 text-base font-semibold text-blue-700 outline-none"
                      placeholder="€ 0"
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setBedrooms(0)
                      setMinPrice('0')
                      setMaxPrice('0')
                    }}
                    className="text-base font-semibold text-blue-700 underline underline-offset-4"
                  >
                    Reset
                  </button>

                </div>

                <Link
                  href="/properties"
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-700 px-7 py-4 text-base font-extrabold text-white shadow-md shadow-blue-700/15 transition hover:bg-blue-800"
                >
                  <span className="text-2xl">⌕</span>
                  Zoeken
                </Link>
              </div>
            </div>
          </div>
        </div>
          <div className="relative mx-auto mt-10 max-w-7xl rounded-[1.5rem] border border-blue-100 bg-white/65 p-5 shadow-lg shadow-blue-900/5 backdrop-blur-sm md:p-6">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-700">
                  Slimme hulp
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#0B1F4D] md:text-3xl">
                  Meer weten over een pand?
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-gray-600">
                  Vergelijk vastgoed en stel je vragen online.
                </p>
              </div>

              <div>
                <textarea
                  placeholder="Wil je kopen, huren of eerst vastgoed vergelijken?"
                  onChange={() => setQuestionSent(false)}
                  className="min-h-[95px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-[#111827] outline-none transition focus:border-blue-600"
                />

                <div className="mt-3 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuestionSent(true)}
                    className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-blue-800"
                  >
                    Vraag versturen
                  </button>

                  {questionSent && (
                    <p className="text-sm font-bold text-green-600">
                      Vraag verzonden ✓
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
      </section>

      <section className="px-5 pb-16 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">
                Nieuw toegevoegd
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#0B1F4D]">
                Nieuwste woningen
              </h2>
            </div>

            <Link
              href="/properties"
              className="text-base font-bold text-blue-700 transition hover:text-blue-900"
            >
              Bekijk alles →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {latestProperties.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="block overflow-hidden rounded-[1.5rem] bg-white shadow-lg shadow-slate-900/5 transition hover:-translate-y-1"
              >
                <div className="h-52 bg-gradient-to-br from-blue-100 via-white to-blue-200">
                  {(() => {
                    const imageSrc =
                      property.image_url ||
                      property.image ||
                      property.photo_url ||
                      property.main_image ||
                      property.images?.[0]

                    return imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={property.title || 'Property'}
                        className="h-full w-full object-cover"
                      />
                    ) : null
                  })()}
                </div>

                <div className="p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
                    {property.city || 'België'}
                  </p>

                  <h3 className="mt-2 text-2xl font-black text-[#0B1F4D]">
                    {property.title || 'Woning'}
                  </h3>

                  <p className="mt-4 text-xl font-black text-blue-700">
                    € {property.price?.toLocaleString() || '0'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}