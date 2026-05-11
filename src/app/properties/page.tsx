'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from '@react-google-maps/api'

export default function PropertiesPage() {
  const router = useRouter()

  const [properties, setProperties] = useState<any[]>([])
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])
  const [compareIds, setCompareIds] = useState<number[]>([])
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedMapProperty, setSelectedMapProperty] = useState<any>(null)
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  const mapContainerStyle = {
    width: '100%',
    height: '320px',
  }

  function houseMarkerIcon() {
    if (!window.google) return undefined

    return {
      path: 'M26 6 L46 23 H41 V46 H31 V34 H21 V46 H11 V23 H6 Z',
      fillColor: '#0B1F4D',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3,
      scale: 1,
      anchor: new window.google.maps.Point(26, 46),
    }
  }

  const propertiesWithLocation = useMemo(() => {
    return properties.filter(
      (property) =>
        Number(property.latitude) &&
        Number(property.longitude)
    )
  }, [properties])

  const center = useMemo(() => {
    if (propertiesWithLocation.length > 0) {
      return {
        lat: Number(propertiesWithLocation[0].latitude),
        lng: Number(propertiesWithLocation[0].longitude),
      }
    }

    return {
      lat: 51.2194,
      lng: 4.4025,
    }
  }, [propertiesWithLocation])

  useEffect(() => {
    checkUser()
    getProperties()
  }, [])

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setUserId('')
      setUserEmail('')
      return
    }

    setUserId(user.id)
    setUserEmail(user.email || '')
    getFavorites(user.id)
  }

  async function getFavorites(currentUserId: string) {
    const { data } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', currentUserId)

    setFavoriteIds(data?.map((item) => Number(item.property_id)) || [])
  }

  async function toggleFavorite(propertyId: number) {
    if (!userId) {
      router.push('/login')
      return
    }

    const isFavorite = favoriteIds.includes(propertyId)

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('property_id', propertyId)

      setFavoriteIds(favoriteIds.filter((id) => id !== propertyId))
    } else {
      await supabase.from('favorites').insert([
        {
          user_id: userId,
          property_id: propertyId,
        },
      ])

      setFavoriteIds([...favoriteIds, propertyId])
    }
  }

  function toggleCompare(propertyId: number) {
    const alreadySelected = compareIds.includes(propertyId)

    if (alreadySelected) {
      setCompareIds(compareIds.filter((id) => id !== propertyId))
      return
    }

    if (compareIds.length >= 4) {
      alert('Je kan maximaal 4 woningen vergelijken')
      return
    }

    setCompareIds([...compareIds, propertyId])
  }

  function goToCompare() {
    if (compareIds.length < 2) {
      alert('Selecteer minstens 2 woningen')
      return
    }

    const params = new URLSearchParams({
      ids: compareIds.join(','),
    })

    router.push(`/compare?${params.toString()}`)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function getProperties() {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .order('id', { ascending: false })

    setProperties(data || [])
  }

  function numberValue(value: any) {
    return Number(String(value || '').replace(/[^\d.]/g, '')) || 0
  }

  function formatPrice(value: any) {
    const number = numberValue(value)

    if (!number) return '-'

    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(number)
  }

  function formatPricePerM2(property: any) {
    const price = numberValue(property.price)
    const area = numberValue(
      property.bewoonbare_oppervlakte ||
        property.oppervlakte ||
        property.living_area
    )

    if (!price || !area) return null

    return `± ${new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price / area)} / m²`
  }

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title?.toLowerCase().includes(search.toLowerCase()) ||
      property.city?.toLowerCase().includes(search.toLowerCase()) ||
      property.address?.toLowerCase().includes(search.toLowerCase())

    const matchesCity =
      city === '' ||
      property.city?.toLowerCase().includes(city.toLowerCase())

    const matchesPrice =
      maxPrice === '' ||
      numberValue(property.price) <= numberValue(maxPrice)

    return matchesSearch && matchesCity && matchesPrice
  })

  const filteredPropertiesWithLocation = useMemo(() => {
    return filteredProperties.filter(
      (property) =>
        Number(property.latitude) &&
        Number(property.longitude)
    )
  }, [filteredProperties])

  const mapKey = filteredPropertiesWithLocation
    .map((property) => `${property.id}-${property.latitude}-${property.longitude}`)
    .join('|')

  useEffect(() => {
    if (!mapInstance || !isLoaded || filteredPropertiesWithLocation.length === 0) return

    const bounds = new window.google.maps.LatLngBounds()

    filteredPropertiesWithLocation.forEach((property) => {
      bounds.extend({
        lat: Number(property.latitude),
        lng: Number(property.longitude),
      })
    })

    const fitMap = () => {
      if (filteredPropertiesWithLocation.length > 1) {
        mapInstance.fitBounds(bounds)
      } else {
        mapInstance.setCenter(bounds.getCenter())
        mapInstance.setZoom(13)
      }
    }

    fitMap()

    const timer = setTimeout(() => {
      fitMap()
    }, 700)

    return () => clearTimeout(timer)
  }, [mapInstance, isLoaded, mapKey])

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-5 py-8 text-[#111827] md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-blue-700">
              SlimWoning
            </p>

            <h1 className="text-4xl font-bold md:text-5xl">
              Woningen vergelijken
            </h1>

            <p className="mt-3 max-w-2xl text-gray-600">
              Bekijk woningen op kaart, vergelijk kenmerken en maak een professioneel PDF rapport.
            </p>

            {userEmail && (
              <p className="mt-2 text-sm text-gray-500">
                Ingelogd als: {userEmail}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/add-property"
              className="rounded-2xl bg-blue-700 px-5 py-3 text-center font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              Woning toevoegen
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-2xl border border-gray-200 bg-white px-5 py-3 font-bold text-[#111827] shadow-sm"
            >
              Uitloggen
            </button>
          </div>
        </div>

        <div className="mb-8 rounded-[2rem] bg-white p-5 shadow-lg md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <input
              placeholder="Zoek op titel, stad of adres..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 rounded-2xl border border-gray-200 bg-[#f8fafc] px-5 outline-none focus:border-blue-600"
            />

            <input
              placeholder="Stad"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-14 rounded-2xl border border-gray-200 bg-[#f8fafc] px-5 outline-none focus:border-blue-600"
            />

            <input
              placeholder="Maximale prijs"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-14 rounded-2xl border border-gray-200 bg-[#f8fafc] px-5 outline-none focus:border-blue-600"
            />

            <button className="h-14 rounded-2xl bg-blue-700 font-bold text-white transition hover:bg-blue-800">
              Zoeken
            </button>
          </div>
        </div>

        <div className="mb-10 overflow-hidden rounded-[2rem] bg-white shadow-xl">
          <div className="h-[320px] w-full">
            {!isLoaded && (
              <div className="flex h-full items-center justify-center text-xl font-bold">
                Kaart laden...
              </div>
            )}

            {isLoaded && (
              <GoogleMap
                key={mapKey || 'empty-map'}
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={11}
                onLoad={(map) => {
                  setMapInstance(map)
                }}
                options={{
                  fullscreenControl: true,
                  streetViewControl: false,
                  mapTypeControl: true,
                }}
                onClick={() => setSelectedMapProperty(null)}
              >
                {filteredPropertiesWithLocation.map((property) => (
                  <Marker
                    key={property.id}
                    position={{
                      lat: Number(property.latitude),
                      lng: Number(property.longitude),
                    }}
                    icon={houseMarkerIcon()}
                    label={{
                      text: '⌂',
                      color: '#ffffff',
                      fontSize: '22px',
                      fontWeight: '900',
                    }}
                    optimized={false}
                    zIndex={999}
                    onClick={() => setSelectedMapProperty(property)}
                  />
                ))}

                {selectedMapProperty && (
                  <InfoWindow
                    position={{
                      lat: Number(selectedMapProperty.latitude),
                      lng: Number(selectedMapProperty.longitude),
                    }}
                    onCloseClick={() => setSelectedMapProperty(null)}
                  >
                    <div className="w-[240px] overflow-hidden rounded-2xl bg-white text-[#111827]">
                      {selectedMapProperty.image && (
                        <img
                          src={selectedMapProperty.image}
                          alt={selectedMapProperty.title}
                          className="mb-3 h-32 w-full rounded-xl object-cover"
                        />
                      )}

                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                        {selectedMapProperty.city || 'SlimWoning'}
                      </p>

                      <h3 className="mt-1 text-lg font-bold">
                        {selectedMapProperty.title}
                      </h3>

                      <p className="mt-2 text-xl font-bold text-blue-700">
                        {formatPrice(selectedMapProperty.price)}
                      </p>

                      <button
                        onClick={() => router.push(`/properties/${selectedMapProperty.id}`)}
                        className="mt-4 w-full rounded-xl bg-[#0B1F4D] px-4 py-3 text-sm font-bold text-white"
                      >
                        Bekijk woning
                      </button>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            )}
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="font-bold text-gray-700">
            {filteredProperties.length} woningen gevonden
          </p>

          <p className="text-sm text-gray-500">
            Selecteer 2 tot 4 woningen om te vergelijken
          </p>
        </div>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => {
            const isFavorite = favoriteIds.includes(Number(property.id))
            const isSelected = compareIds.includes(Number(property.id))

            return (
              <div
                key={property.id}
                className={`group overflow-hidden rounded-[2rem] bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl ${
                  isSelected ? 'ring-2 ring-blue-700' : ''
                }`}
              >
                <div className="relative overflow-hidden">
                  <Link href={`/properties/${property.id}`}>
                    <img
                      src={property.image}
                      alt={property.title}
                      className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </Link>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

                  <button
                    onClick={() => toggleFavorite(Number(property.id))}
                    className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow"
                  >
                    {isFavorite ? '❤️' : '🤍'}
                  </button>
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-bold">{property.title}</h2>

                  <p className="mt-2 text-3xl font-bold text-blue-700">
                    {formatPrice(property.price)}
                  </p>

                  {formatPricePerM2(property) && (
                    <div className="mt-2 inline-flex flex-wrap items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                      <span>{formatPricePerM2(property)}</span>
                      <span className="text-xs font-semibold text-gray-500">
                        op basis van vraagprijs
                      </span>
                    </div>
                  )}

                  <p className="mt-1 text-gray-500">
                    {property.address
                      ? `${property.address}, ${property.city}`
                      : property.city}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Badge text={`${property.slaapkamers || '-'} slp.`} />
                    <Badge text={`${property.badkamers || '-'} badk.`} />
                    <Badge text={`${property.bewoonbare_oppervlakte || '-'} m²`} />
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Link
                      href={`/properties/${property.id}`}
                      className="rounded-2xl bg-[#111827] px-4 py-3 text-center font-bold text-white"
                    >
                      Bekijk
                    </Link>

                    <button
                      onClick={() => toggleCompare(Number(property.id))}
                      className={`rounded-2xl border px-4 py-3 font-bold ${
                        isSelected
                          ? 'border-blue-700 bg-blue-50 text-blue-700'
                          : 'border-gray-200'
                      }`}
                    >
                      {isSelected ? 'Geselecteerd' : 'Vergelijk'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {compareIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 z-50 w-[92%] max-w-2xl -translate-x-1/2 rounded-[2rem] bg-[#111827] p-4 text-white shadow-2xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="font-bold">
              {compareIds.length} woning
              {compareIds.length > 1 ? 'en' : ''} geselecteerd
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setCompareIds([])}
                className="rounded-2xl bg-white/10 px-4 py-3 font-bold text-white transition hover:bg-white/20"
              >
                Wissen
              </button>

              <button
                onClick={goToCompare}
                disabled={compareIds.length < 2}
                className="rounded-2xl bg-white px-4 py-3 font-bold text-[#111827] transition hover:bg-gray-100 disabled:opacity-40"
              >
                Vergelijk & PDF
              </button>
            </div>
          </div>
        </div>
      )}
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