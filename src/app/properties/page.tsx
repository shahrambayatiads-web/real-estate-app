'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PropertiesPage() {
  const router = useRouter()

  const [properties, setProperties] = useState<any[]>([])
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])
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
    <div className="min-h-screen bg-black text-white px-5 py-8 md:px-10">
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

            return (
              <div
                key={property.id}
                className="relative rounded-2xl bg-[#111] p-5"
              >
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
    </div>
  )
}