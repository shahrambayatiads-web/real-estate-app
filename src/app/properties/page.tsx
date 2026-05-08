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
      const { error } = await supabase
        .from('favorites')
        .insert([
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

    if (error) {
      console.log(error)
    } else {
      setProperties(data)
    }
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
      Number(property.price) <= Number(maxPrice)

    return matchesSearch && matchesCity && matchesPrice
  })

  return (
    <div className="min-h-screen bg-black px-5 py-8 text-white md:px-10">
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold md:text-5xl">
            Woningen 🏠
          </h1>

          <p className="text-sm text-gray-400 md:text-base">
            Ingelogd als: {userEmail}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full rounded-xl bg-white px-5 py-3 font-bold text-black md:w-auto"
        >
          Uitloggen
        </button>
      </div>

      <div className="mb-9 grid grid-cols-1 gap-4 md:grid-cols-3">
        <input
          placeholder="Zoek op titel of stad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border-0 p-4 text-black"
        />

        <input
          placeholder="Stad"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-xl border-0 p-4 text-black"
        />

        <input
          placeholder="Maximale prijs"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="rounded-xl border-0 p-4 text-black"
        />
      </div>

      {filteredProperties.length === 0 ? (
        <p className="text-xl text-gray-400">
          Geen woningen gevonden.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => {
            const isFavorite = favoriteIds.includes(Number(property.id))
            const isSelected = compareIds.includes(Number(property.id))

            return (
              <div
                key={property.id}
                className={`relative rounded-2xl bg-[#111] p-5 ${
                  isSelected ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <button
                  onClick={() => toggleCompare(Number(property.id))}
                  className={`absolute left-4 top-4 z-10 rounded-xl px-3 py-2 text-sm font-bold ${
                    isSelected
                      ? 'bg-green-500 text-black'
                      : 'bg-white text-black'
                  }`}
                >
                  {isSelected ? 'Geselecteerd' : 'Vergelijk'}
                </button>

                <button
                  onClick={() => toggleFavorite(Number(property.id))}
                  className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-black"
                >
                  {isFavorite ? '❤️' : '🤍'}
                </button>

                <Link
                  href={`/properties/${property.id}`}
                  className="text-white no-underline"
                >
                  <img
                    src={property.image}
                    alt={property.title}
                    className="h-52 w-full rounded-xl object-cover"
                  />

                  <h2 className="mt-4 text-2xl font-bold">
                    {property.title}
                  </h2>

                  <p className="mt-2">€ {property.price}</p>

                  <p className="text-gray-400">{property.city}</p>
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {compareIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 z-50 w-[90%] max-w-xl -translate-x-1/2 rounded-2xl bg-white p-4 text-black shadow-2xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="font-bold">
              {compareIds.length} woning
              {compareIds.length > 1 ? 'en' : ''} geselecteerd
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setCompareIds([])}
                className="rounded-xl bg-gray-200 px-4 py-3 font-bold"
              >
                Wissen
              </button>

              <button
                onClick={goToCompare}
                disabled={compareIds.length < 2}
                className="rounded-xl bg-black px-4 py-3 font-bold text-white disabled:opacity-40"
              >
                Vergelijk slim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}