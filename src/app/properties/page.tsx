'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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

  useEffect(() => {
    checkUser()
    getProperties()
  }, [])

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
    } else {
      setUserId(user.id)
      setUserEmail(user.email || '')
      getFavorites(user.id)
    }
  }

  async function getFavorites(currentUserId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', currentUserId)

    if (error) {
      console.log(error)
    } else {
      setFavoriteIds(data.map((item) => Number(item.property_id)))
    }
  }

  async function toggleFavorite(propertyId: number) {
    if (!userId) {
      alert('Je moet eerst inloggen')
      return
    }

    const isFavorite = favoriteIds.includes(propertyId)

    if (isFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('property_id', propertyId)

      if (error) {
        console.log(error)
        alert('Fout bij verwijderen uit favorieten')
      } else {
        setFavoriteIds(favoriteIds.filter((id) => id !== propertyId))
      }
    } else {
      const { error } = await supabase.from('favorites').insert([
        {
          user_id: userId,
          property_id: propertyId,
        },
      ])

      if (error) {
        console.log(error)
        alert('Fout bij toevoegen aan favorieten')
      } else {
        setFavoriteIds([...favoriteIds, propertyId])
      }
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

    router.push(`/compare?ids=${compareIds.join(',')}`)
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert(error.message)
    } else {
      router.push('/login')
    }
  }

  async function getProperties() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.log(error)
    } else {
      setProperties(data || [])
    }
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

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title?.toLowerCase().includes(search.toLowerCase()) ||
      property.city?.toLowerCase().includes(search.toLowerCase())

    const matchesCity =
      city === '' ||
      property.city?.toLowerCase().includes(city.toLowerCase())

    const matchesPrice =
      maxPrice === '' ||
      numberValue(property.price) <= numberValue(maxPrice)

    return matchesSearch && matchesCity && matchesPrice
  })

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
              Selecteer woningen, vergelijk kenmerken en maak daarna een
              duidelijk rapport.
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
              placeholder="Zoek op titel of stad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 w-full rounded-2xl border border-gray-200 bg-[#f8fafc] px-5 text-[15px] outline-none transition focus:border-blue-600"
            />

            <input
              placeholder="Stad"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-14 w-full rounded-2xl border border-gray-200 bg-[#f8fafc] px-5 text-[15px] outline-none transition focus:border-blue-600"
            />

            <input
              placeholder="Maximale prijs"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-14 w-full rounded-2xl border border-gray-200 bg-[#f8fafc] px-5 text-[15px] outline-none transition focus:border-blue-600"
            />

            <button className="flex h-14 items-center justify-center rounded-2xl bg-blue-700 px-6 font-bold text-white transition hover:bg-blue-800">
              Zoeken
            </button>
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

        {filteredProperties.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-8 text-center shadow-lg">
            <p className="text-xl font-bold">
              Geen woningen gevonden.
            </p>

            <p className="mt-2 text-gray-500">
              Pas je zoekfilters aan of voeg een nieuwe woning toe.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => {
              const isFavorite = favoriteIds.includes(Number(property.id))
              const isSelected = compareIds.includes(Number(property.id))

              return (
                <div
                  key={property.id}
                  className={`group overflow-hidden rounded-[2rem] bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${
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

                    <div className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-blue-700 shadow">
                      EPC {property.epc || '-'}
                    </div>

                    <button
                      onClick={() => toggleFavorite(Number(property.id))}
                      className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow transition hover:scale-105"
                    >
                      {isFavorite ? '❤️' : '🤍'}
                    </button>

                    <button
                      onClick={() => toggleCompare(Number(property.id))}
                      className={`absolute bottom-4 left-4 rounded-2xl px-4 py-3 text-sm font-bold shadow transition hover:scale-[1.02] ${
                        isSelected
                          ? 'bg-blue-700 text-white'
                          : 'bg-white text-[#111827]'
                      }`}
                    >
                      {isSelected ? 'Geselecteerd' : 'Vergelijk'}
                    </button>
                  </div>

                  <div className="p-6">
                    <Link
                      href={`/properties/${property.id}`}
                      className="text-[#111827]"
                    >
                      <h2 className="text-2xl font-bold leading-tight transition hover:text-blue-700">
                        {property.title}
                      </h2>
                    </Link>

                    <p className="mt-2 text-3xl font-bold text-blue-700">
                      {formatPrice(property.price)}
                    </p>

                    <p className="mt-1 text-gray-500">
                      {property.city}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Badge text={`${property.slaapkamers || '-'} slp.`} />
                      <Badge text={`${property.badkamers || '-'} badk.`} />
                      <Badge text={`${property.bewoonbare_oppervlakte || '-'} m²`} />
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <Link
                        href={`/properties/${property.id}`}
                        className="rounded-2xl bg-[#111827] px-4 py-3 text-center font-bold text-white transition hover:bg-black"
                      >
                        Bekijk
                      </Link>

                      <button
                        onClick={() => toggleCompare(Number(property.id))}
                        className={`rounded-2xl border px-4 py-3 font-bold transition ${
                          isSelected
                            ? 'border-blue-700 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-[#111827] hover:border-blue-700'
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
        )}
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